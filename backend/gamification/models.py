from django.db import models
from django.conf import settings

class Badge(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="badges")
    title = models.CharField(max_length=100)
    awarded_on = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.email} - {self.title}"
