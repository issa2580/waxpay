import requests
import hashlib
import json
from django.conf import settings
import logging

logger = logging.getLogger(__name__)


class PaytechService:
    BASE_URL = 'https://paytech.sn/api'

    @staticmethod
    def request_payment(item_name, item_price, ref_command, custom_field, payment_method, user):
        if custom_field is None:
            custom_field = {}

        url = f'{PaytechService.BASE_URL}/payment/request-payment'

        try:
            response = requests.post(
                url,
                json={
                    'item_name': item_name,
                    'item_price': item_price,
                    'currency': 'XOF',
                    'ref_command': ref_command,
                    'command_name': item_name,
                    'env': settings.PAYTECH_ENV,
                    'target_payment': payment_method,
                    'success_url': settings.PAYTECH_SUCCESS_URL,
                    'cancel_url': settings.PAYTECH_CANCEL_URL,
                    'ipn_url': settings.PAYTECH_IPN_URL,
                    'custom_field': custom_field or {},
                },
                headers={
                    'API_KEY': settings.PAYTECH_API_KEY,
                    'API_SECRET': settings.PAYTECH_API_SECRET,
                },
                timeout=30
            )
            logger.info(f"PayTech Request Payload: {response.request.body}")
            logger.info(f"PayTech Response ({response.status_code}): {response.text}")


            json_response = response.json()

            if response.status_code in [201, 200]:
                if payment_method and ',' not in payment_method:
                    query_params = {
                        'pn': user.phone_number,
                        'nn': user.phone_number[4:] if len(user.phone_number) > 4 else user.phone_number,
                        'fn': user.full_name,
                        'tp': payment_method,
                        'nac': 0 if payment_method == 'Carte Bancaire' else 1
                    }

                    from urllib.parse import urlencode
                    query_string = urlencode(query_params)
                    
                    redirect_url = json_response.get('redirectUrl') or json_response.get('redirect_url')
                    if redirect_url:
                        json_response['redirectUrl'] = json_response['redirect_url'] = f"{redirect_url}?{query_string}"

            return json_response

        except requests.exceptions.RequestException as e:
            logger.error(f"PayTech request error: {str(e)}")
            return {'success': 0, 'message': str(e)}

    @staticmethod
    def verify_ipn(request):
        api_key_sha256 = request.POST.get('api_key_sha256')
        api_secret_sha256 = request.POST.get('api_secret_sha256')

        expected_api_key = hashlib.sha256(
            settings.PAYTECH_API_KEY.encode()
        ).hexdigest()
        expected_api_secret = hashlib.sha256(
            settings.PAYTECH_API_SECRET.encode()
        ).hexdigest()

        return (expected_api_key == api_key_sha256 and
                expected_api_secret == api_secret_sha256)