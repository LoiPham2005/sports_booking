import 'package:dio/dio.dart';
import 'package:sports_booking_mobile/core/common/constants/api_endpoints.dart';
import 'package:sports_booking_mobile/core/data/network/api_response.dart';
import 'package:sports_booking_mobile/features/_reference/voucher/data/models/voucher_model.dart';
import 'package:retrofit/retrofit.dart';

part 'voucher_service.g.dart';

@RestApi()
abstract class VoucherService {
  factory VoucherService(Dio dio) = _VoucherService;

  @GET(ApiEndpoints.vouchers)
  Future<ApiResponse<List<VoucherModel>>> getVouchers();

  @GET('${ApiEndpoints.vouchers}/{id}')
  Future<ApiResponse<VoucherModel>> getVoucherDetail(@Path('id') String id);

  @GET('${ApiEndpoints.vouchers}/search')
  Future<ApiResponse<List<VoucherModel>>> searchVouchers(
    @Query('q') String query,
  );
}
