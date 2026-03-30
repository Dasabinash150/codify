from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin

from account.models import User, EmailOTP


class UserModelAdmin(BaseUserAdmin):
    list_display = ("id", "email", "name", "tc", "is_admin", "is_active", "created_at")
    list_filter = ("is_admin", "is_active", "is_superuser")
    ordering = ("email", "id")
    search_fields = ("email", "name")
    readonly_fields = ("created_at", "updated_at", "last_login")

    fieldsets = (
        ("User Credentials", {"fields": ("email", "password")}),
        ("Personal Info", {"fields": ("name", "tc")}),
        ("Permissions", {"fields": ("is_admin", "is_active", "is_superuser", "groups", "user_permissions")}),
        ("Important Dates", {"fields": ("last_login", "created_at", "updated_at")}),
    )

    add_fieldsets = (
        (
            None,
            {
                "classes": ("wide",),
                "fields": ("email", "name", "tc", "password1", "password2"),
            },
        ),
    )

    filter_horizontal = ("groups", "user_permissions")


@admin.register(EmailOTP)
class EmailOTPAdmin(admin.ModelAdmin):
    list_display = ("id", "email", "otp", "is_verified", "created_at")
    search_fields = ("email",)
    list_filter = ("is_verified", "created_at")


admin.site.register(User, UserModelAdmin)