import java.text.Normalizer
import com.android.build.api.variant.ApplicationAndroidComponentsExtension
import com.android.build.gradle.AppExtension
import com.android.build.api.variant.FilterConfiguration

// =========================================================
//  HELPER - Chuyển tên app thành tên file an toàn (ASCII)
//  VD: "ĐẶT SÂN 247" → "dat-san-247"
// =========================================================
fun String.toSafeFileName(): String {
    val normalized = Normalizer.normalize(this, Normalizer.Form.NFD)
    return normalized
        .replace(Regex("[\\p{InCombiningDiacriticalMarks}]"), "")
        .replace("Đ", "D").replace("đ", "d")
        .replace(Regex("[^a-zA-Z0-9\\s-]"), "")
        .trim()
        .replace(Regex("\\s+"), "-")
        .lowercase()
}

// =========================================================
//  Lấy extensions thủ công (apply from script không có
//  type-safe accessors)
// =========================================================
val androidExt = project.extensions.getByType<AppExtension>()
val androidComponentsExt = project.extensions.getByType<ApplicationAndroidComponentsExtension>()

// =========================================================
//  HELPER - Lấy app name theo thứ tự ưu tiên:
//  1. resValue trực tiếp (hoạt động ở execution phase - AAB)
//  2. flavorizr.gradle.kts (parse từ file - hoạt động ở mọi phase)
//  3. flavorizr.yaml
//  4. Tên flavor (dev, stg, prod)
//
//  ⚠️ resValue chỉ available ở execution phase (renameAab doLast),
//  còn APK rename chạy ở configuration phase → resValue null → tự
//  fallback sang bước 2 parse file.
// =========================================================
fun getAppNameForFlavor(flavor: String, isExecutionPhase: Boolean = false): String {
    val flavorConfig = androidExt.productFlavors.findByName(flavor)

    // 1. Thử lấy từ resValue (chỉ hoạt động ở execution phase)
    val rawAppName = flavorConfig?.resValues?.get("string/app_name")?.value
        ?: flavorConfig?.resValues?.get("app_name")?.value
    if (rawAppName != null) {
        if (isExecutionPhase) println("🟢 [$flavor] App name source: resValue → $rawAppName")
        return rawAppName.toSafeFileName()
    }

    // 2. Parse trực tiếp từ flavorizr.gradle.kts (nguồn truth chính)
    val flavorizrGradleFile = project.file("flavorizr.gradle.kts")
    if (flavorizrGradleFile.exists()) {
        val content = flavorizrGradleFile.readText()
        val blockRegex = Regex(
            "create\\(\"$flavor\"\\)\\s*\\{[^}]*resValue[^)]*value\\s*=\\s*\"([^\"]+)\"[^}]*\\}",
            RegexOption.DOT_MATCHES_ALL
        )
        val match = blockRegex.find(content)
        if (match != null) {
            val name = match.groupValues[1]
            if (isExecutionPhase) println("🟢 [$flavor] App name source: flavorizr.gradle.kts → $name")
            return name.toSafeFileName()
        }
    }

    // 3. Đọc từ flavorizr.yaml
    val flavorizrYamlFile = rootProject.file("flavorizr.yaml")
    if (flavorizrYamlFile.exists()) {
        val content = flavorizrYamlFile.readText()
        val regex = Regex("^\\s{2}$flavor:\\s*\\n(?:.*\\n)*?\\s{4}app:\\s*\\n\\s{6}name:\\s*\"([^\"]+)\"", RegexOption.MULTILINE)
        val match = regex.find(content)
        if (match != null) {
            val yamlName = match.groupValues[1]
            if (isExecutionPhase) println("🟢 [$flavor] App name source: flavorizr.yaml → $yamlName")
            return yamlName.toSafeFileName()
        }
    }

    return flavor
}

// =========================================================
//  RENAME APK TRỰC TIẾP (tối ưu nhất - không cần copy)
// =========================================================
androidComponentsExt.onVariants { variant ->
    variant.outputs.forEach { output ->
        val flavor = variant.flavorName ?: "noflavor"
        val buildType = variant.buildType ?: "release"

        // Lấy app name (resValue → extra → yaml → flavor)
        val appName = getAppNameForFlavor(flavor)
        println("✅ Final App Name for renaming: $appName")

        // Lấy version info
        val versionName = variant.outputs.first().versionName.orNull ?: "1.0.0"
        val versionCode = variant.outputs.first().versionCode.orNull ?: 1

        // Lấy ABI (nếu có split)
        val abiFilter = output.filters.find {
            it.filterType == FilterConfiguration.FilterType.ABI
        }?.identifier
        val abi = if (abiFilter != null && abiFilter != "universal") "-${abiFilter}" else ""

        // Tên file mới
        val newName = "${appName}-${buildType}${abi}-v${versionName}(${versionCode}).apk"

        // Rename trực tiếp tại nguồn
        (output as com.android.build.api.variant.impl.VariantOutputImpl)
            .outputFileName.set(newName)
    }
}

// =========================================================
//  RENAME AAB with Version Info
// =========================================================
tasks.register("renameAab") {
    doLast {
        val bundleDir = file("${layout.buildDirectory.get()}/outputs/bundle")
        if (!bundleDir.exists()) return@doLast

        bundleDir.walkBottomUp().filter { it.extension == "aab" }.forEach { aabFile ->
            // Chỉ xử lý file gốc của Flutter (thường là *-release.aab)
            // Bỏ qua nếu file đã được đổi tên theo format mới (có chứa vX.X.X)
            if (!aabFile.name.contains("release", ignoreCase = true) || aabFile.name.contains("-v")) {
                return@forEach
            }

            val parentName = aabFile.parentFile.name
            val flavor = when {
                parentName.contains("DevRelease", ignoreCase = true) -> "dev"
                parentName.contains("StgRelease", ignoreCase = true) -> "stg"
                parentName.contains("ProdRelease", ignoreCase = true) -> "prod"
                else -> return@forEach // Không phải bản Release thì bỏ qua
            }

            val appName = getAppNameForFlavor(flavor, isExecutionPhase = true)
            val flavorConfig = androidExt.productFlavors.findByName(flavor)
            val versionName = androidExt.defaultConfig.versionName ?: "1.0.0"
            val versionCode = androidExt.defaultConfig.versionCode ?: 1
            val versionSuffix = flavorConfig?.versionNameSuffix ?: ""

            val newName = "${appName}-release-v${versionName}${versionSuffix}(${versionCode}).aab"
            val newFile = File(aabFile.parentFile, newName)

            // Tránh đổi tên nếu file nguồn và đích giống hệt nhau
            if (aabFile.absolutePath == newFile.absolutePath) return@forEach

            if (aabFile.renameTo(newFile)) {
                println("✅ AAB renamed → $newName")
            } else {
                // Nếu thất bại, có thể file đang bị khóa, ta không in lỗi to để tránh hoang mang
                // vì Gradle có thể chạy finalizedBy nhiều lần.
            }
        }
    }
}

// Auto-run renameAab after bundle tasks
tasks.whenTaskAdded {
    if (name.startsWith("bundle") && name.endsWith("Release")) {
        finalizedBy("renameAab")
    }
}
