from rest_framework import serializers
from .models import SavingsGoal

class GoalSerializer(serializers.ModelSerializer):
    progress = serializers.SerializerMethodField()

    class Meta:
        model = SavingsGoal
        fields = ("id", "title", "target_amount", "current_amount", "progress")

    def get_progress(self, obj):
        if obj.target_amount == 0:
            return 0
        return round((obj.current_amount / obj.target_amount) * 100, 2)
