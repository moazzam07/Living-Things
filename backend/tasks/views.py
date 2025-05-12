from datetime import datetime
import time
from urllib import request
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth.models import User
from .models import Task
from .serializers import RegisterSerializer, TaskSerializer
from rest_framework.parsers import MultiPartParser
from .utils import import_tasks_from_excel, validate_due_date
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import PermissionDenied, NotFound

class RegisterView(APIView):
    def post(self, request, *args, **kwargs):
        username = request.data.get('username')
        if User.objects.filter(username=username).exists():
            return Response({'detail': 'User with this name already exists'}, status=status.HTTP_400_BAD_REQUEST)
        
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)

class TaskListCreateView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request, *args, **kwargs):
        try: 
            tasks = Task.objects.filter(user=request.user)
            serializer = TaskSerializer(tasks, many=True)
            return Response(serializer.data)
        except:
            return Response({'detail': "No Task found"})

    def post(self, request, *args, **kwargs):
        if not request.user.is_authenticated:
            raise PermissionDenied("Send request again to continue.")

        if not validate_due_date(request.data.get('due_date')):
            return Response({'detail': 'Due Date cannot be less than todays date'}, status=400)
        
        serializer = TaskSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class TaskDetailView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    def get_task(self, user, id):
        try:
            return Task.objects.get(user=user, id=id)
        except Task.DoesNotExist:
            raise NotFound("Task not found.")

    def get(self, request, id):    
        task = self.get_task(request.user, id)
        serializer = TaskSerializer(task)
        return Response(serializer.data)
        
    def patch(self, request, id):
        task = self.get_task(request.user, id)
        serializer = TaskSerializer(task, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, id):
        task = Task.objects.get(id=id, user=request.user)
        task.delete()

        tasks = Task.objects.filter(user=request.user)
        serializer = TaskSerializer(tasks, many=True)
        return Response(serializer.data)

class ImportTasksView(APIView):
    parser_classes = [MultiPartParser]
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        file = request.FILES.get('file')
        if file:
            try:
                success = import_tasks_from_excel(file, request.user)
                return Response({'imported': success}, status=200)
            except AttributeError as e:
                return Response({'error': str(e)}, status=400)
        return Response({'error': 'No file uploaded'}, status=400)
