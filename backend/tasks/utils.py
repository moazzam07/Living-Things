from datetime import datetime
import pandas as pd
from .models import Task

def import_tasks_from_excel(file, user):
    df = pd.read_excel(file)
    tasks = []
    for _, row in df.iterrows():
        task_data = row.to_dict()
        if not validate_due_date(task_data['due_date']):
            raise AttributeError("Due Date cannot be less than today's date")

        tasks.append(task_data)
    print(tasks)
    for task in tasks:
        Task.objects.create(
            user=user,
            title=task['title'],
            description=task['description'],
            effort=task['efforts'],
            due_date=task['due_date']
        )
    return df.shape[0]

def validate_due_date(due_date):
    date = datetime.fromisoformat(due_date.replace("Z", "+00:00")).date()
    return date >= datetime.now().date()