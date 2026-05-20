// =========================================================
//  AUTO OPEN FILE EXPLORER AFTER BUILD (apk folder)
// =========================================================
tasks.register("openApkFolder") {
    doLast {
        val apkDir = file("${layout.buildDirectory.get()}/outputs/apk")

        if (apkDir.exists()) {
            val os = System.getProperty("os.name").lowercase()

            try {
                when {
                    os.contains("win") -> {
                        Runtime.getRuntime().exec("explorer \"${apkDir.absolutePath}\"")
                        println("✅ Opened folder: ${apkDir.absolutePath}")
                    }
                    os.contains("mac") -> {
                        Runtime.getRuntime().exec(arrayOf("open", apkDir.absolutePath))
                        println("✅ Opened folder: ${apkDir.absolutePath}")
                    }
                    os.contains("nix") || os.contains("nux") -> {
                        Runtime.getRuntime().exec(arrayOf("xdg-open", apkDir.absolutePath))
                        println("✅ Opened folder: ${apkDir.absolutePath}")
                    }
                    else -> {
                        println("⚠️ Unknown OS, cannot open folder automatically")
                        println("📁 APK location: ${apkDir.absolutePath}")
                    }
                }
            } catch (e: Exception) {
                println("❌ Failed to open folder: ${e.message}")
                println("📁 APK location: ${apkDir.absolutePath}")
            }
        } else {
            println("❌ APK folder not found: ${apkDir.absolutePath}")
        }
    }
}

// Auto-run openApkFolder after APK build tasks
tasks.whenTaskAdded {
    if (name.matches(Regex("assemble.*Release"))) {
        finalizedBy("openApkFolder")
    }
}

// =========================================================
//  AUTO OPEN FILE EXPLORER AFTER AAB BUILD (bundle folder)
// =========================================================
tasks.register("openAabFolder") {
    doLast {
        val aabDir = file("${layout.buildDirectory.get()}/outputs/bundle")

        if (aabDir.exists()) {
            val os = System.getProperty("os.name").lowercase()

            try {
                when {
                    os.contains("win") -> {
                        Runtime.getRuntime().exec("explorer \"${aabDir.absolutePath}\"")
                        println("✅ Opened folder: ${aabDir.absolutePath}")
                    }
                    os.contains("mac") -> {
                        Runtime.getRuntime().exec(arrayOf("open", aabDir.absolutePath))
                        println("✅ Opened folder: ${aabDir.absolutePath}")
                    }
                    os.contains("nix") || os.contains("nux") -> {
                        Runtime.getRuntime().exec(arrayOf("xdg-open", aabDir.absolutePath))
                        println("✅ Opened folder: ${aabDir.absolutePath}")
                    }
                    else -> {
                        println("⚠️ Unknown OS, cannot open folder automatically")
                        println("📁 AAB location: ${aabDir.absolutePath}")
                    }
                }
            } catch (e: Exception) {
                println("❌ Failed to open folder: ${e.message}")
                println("📁 AAB location: ${aabDir.absolutePath}")
            }
        } else {
            println("❌ AAB folder not found: ${aabDir.absolutePath}")
        }
    }
}

// Auto-run openAabFolder after bundle tasks
tasks.whenTaskAdded {
    if (name.matches(Regex("bundle.*Release"))) {
        finalizedBy("openAabFolder")
    }
}
