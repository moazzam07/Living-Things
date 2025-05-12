from django.urls import path
from .views import RegisterView, TaskListCreateView, TaskDetailView, ImportTasksView
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

urlpatterns = [
    path('register', RegisterView.as_view()),
    path('login', TokenObtainPairView.as_view()),
    path('refresh', TokenRefreshView.as_view()),
    path('tasks', TaskListCreateView.as_view()),
    path('tasks/<int:id>', TaskDetailView.as_view()),
    path('tasks/import', ImportTasksView.as_view()),
]
