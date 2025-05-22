from datetime import datetime
import pandas as pd
from .models import Task

def import_tasks_from_excel(file, user):
        df = pd.read_excel(file)
        tasks = []
        for _, row in df.iterrows():
            task_data = row.to_dict()
            if not TaskService.validate_due_date(task_data['due_date']):
                raise AttributeError("Due Date cannot be less than today's date")

            tasks.append(task_data)
        
        for task in tasks:
            Task.objects.create(
                user=user,
                title=task['title'],
                description=task['description'],
                effort=task['efforts'],
                due_date=task['due_date']
            )
        return df.shape[0]


class TaskService:

    @staticmethod
    def validate_due_date(due_date):
        if isinstance(due_date, str):
            due_date = datetime.fromisoformat(due_date.replace("Z", "+00:00"))

        return due_date >= datetime.now()

    @staticmethod
    def get_user_task(user, id):
        try:
            return Task.objects.get(user=user, id=id)
        except Task.DoesNotExist:
            return None

    @staticmethod
    def get_tasks_for_user(user):
        return Task.objects.filter(user=user)

    @staticmethod
    def delete_task(task):
        task.delete()
