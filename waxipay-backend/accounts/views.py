# ===========================================
# accounts/views.py
# ===========================================
from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from django.utils import timezone
from datetime import timedelta
import random
import logging

from .models import User, Wallet, OTP
from .serializers import RegisterSerializer, UserSerializer, WalletSerializer

logger = logging.getLogger(__name__)


class RegisterView(generics.CreateAPIView):
    """Inscription d'un nouvel utilisateur"""
    queryset = User.objects.all()
    permission_classes = [AllowAny]
    serializer_class = RegisterSerializer
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        
        refresh = RefreshToken.for_user(user)
        
        return Response({
            'success': True,
            'message': 'Inscription réussie',
            'user': UserSerializer(user).data,
            'tokens': {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }
        }, status=status.HTTP_201_CREATED)


class LoginView(APIView):
    """Connexion utilisateur"""
    permission_classes = [AllowAny]
    
    def post(self, request):
        phone_number = request.data.get('phone_number')
        password = request.data.get('password')
        
        if not phone_number or not password:
            return Response(
                {
                    'success': False,
                    'error': 'Numéro de téléphone et mot de passe requis'
                },
                status=status.HTTP_400_BAD_REQUEST
            )
        
        user = authenticate(username=phone_number, password=password)
        
        if user:
            if not user.is_active:
                return Response(
                    {'success': False, 'error': 'Compte désactivé'},
                    status=status.HTTP_403_FORBIDDEN
                )
            
            refresh = RefreshToken.for_user(user)
            return Response({
                'success': True,
                'message': 'Connexion réussie',
                'user': UserSerializer(user).data,
                'tokens': {
                    'refresh': str(refresh),
                    'access': str(refresh.access_token),
                }
            })
        
        return Response(
            {'success': False, 'error': 'Identifiants invalides'},
            status=status.HTTP_401_UNAUTHORIZED
        )


class LogoutView(APIView):
    """Déconnexion utilisateur"""
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        try:
            refresh_token = request.data.get("refresh")
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response({
                'success': True,
                'message': 'Déconnexion réussie'
            })
        except Exception as e:
            return Response(
                {'success': False, 'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )


class ProfileView(generics.RetrieveUpdateAPIView):
    """Récupérer et mettre à jour le profil utilisateur"""
    permission_classes = [IsAuthenticated]
    serializer_class = UserSerializer
    
    def get_object(self):
        return self.request.user


class WalletView(generics.RetrieveAPIView):
    """Récupérer le portefeuille de l'utilisateur"""
    permission_classes = [IsAuthenticated]
    serializer_class = WalletSerializer
    
    def get_object(self):
        return self.request.user.wallet


class SendOTPView(APIView):
    """Envoyer un code OTP"""
    permission_classes = [AllowAny]
    
    def post(self, request):
        phone_number = request.data.get('phone_number')
        
        if not phone_number:
            return Response(
                {'success': False, 'error': 'Numéro de téléphone requis'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            user = User.objects.get(phone_number=phone_number)
        except User.DoesNotExist:
            return Response(
                {'success': False, 'error': 'Utilisateur introuvable'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        code = str(random.randint(100000, 999999))
        expires_at = timezone.now() + timedelta(minutes=10)
        
        OTP.objects.create(user=user, code=code, expires_at=expires_at)
        
        # TODO: Intégrer un service SMS (ex: Twilio, Orange SMS API)
        logger.info(f"OTP code for {phone_number}: {code}")
        
        return Response({
            'success': True,
            'message': 'Code OTP envoyé avec succès',
            'dev_code': code if request.data.get('dev_mode') else None
        })


class VerifyOTPView(APIView):
    """Vérifier un code OTP"""
    permission_classes = [AllowAny]
    
    def post(self, request):
        phone_number = request.data.get('phone_number')
        code = request.data.get('code')
        
        if not phone_number or not code:
            return Response(
                {'success': False, 'error': 'Tous les champs sont requis'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            user = User.objects.get(phone_number=phone_number)
        except User.DoesNotExist:
            return Response(
                {'success': False, 'error': 'Utilisateur introuvable'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        otp = OTP.objects.filter(
            user=user,
            code=code,
            is_used=False,
            expires_at__gt=timezone.now()
        ).first()
        
        if not otp:
            return Response(
                {'success': False, 'error': 'Code OTP invalide ou expiré'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        otp.is_used = True
        otp.save()
        
        user.is_verified = True
        user.save()
        
        refresh = RefreshToken.for_user(user)
        
        return Response({
            'success': True,
            'message': 'Vérification réussie',
            'user': UserSerializer(user).data,
            'tokens': {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }
        })