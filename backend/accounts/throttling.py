from rest_framework.throttling import AnonRateThrottle

class AuthRateThrottle(AnonRateThrottle):
    scope = 'auth'
    rate = '10/minute'
