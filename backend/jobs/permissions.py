from rest_framework import permissions

class IsHRUser(permissions.BasePermission):
    """
    Custom permission to only allow HR users to create, update, or delete objects.
    """

    def has_permission(self, request, view):
        # Check if the user is authenticated and is an HR user
        return request.user.is_authenticated and getattr(request.user, 'user_type', None) == 'human_resources'
