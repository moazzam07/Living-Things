from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth.models import User
from .serializers import RegisterSerializer, TaskSerializer
from rest_framework.parsers import MultiPartParser
from .utils import TaskService, import_tasks_from_excel
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import NotFound

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
        tasks = TaskService.get_tasks_for_user(request.user)
        serializer = TaskSerializer(tasks, many=True)
        return Response(serializer.data)

    def post(self, request, *args, **kwargs):
        if not TaskService.validate_due_date(request.data.get('due_date')):
            return Response({'detail': 'Due Date cannot be less than todays date'}, status=400)
        
        serializer = TaskSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class TaskDetailView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, id):    
        task = TaskService.get_user_task(request.user, id)
        if not task:
            raise NotFound("Task not found.")
        serializer = TaskSerializer(task)
        return Response(serializer.data)
        
    def patch(self, request, id):
        task = TaskService.get_user_task(request.user, id)
        if not task:
            raise NotFound("Task not found.")

        if 'due_date' in request.data and not TaskService.validate_due_date(request.data.get('due_date')):
            return Response({'detail': 'Due Date cannot be less than today\'s date'}, status=status.HTTP_400_BAD_REQUEST)

        serializer = TaskSerializer(task, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

    def delete(self, request, id):
        task = TaskService.get_user_task(request.user, id)
        if not task:
            raise NotFound("Task not found.")

        TaskService.delete_task(task)

        tasks = TaskService.get_tasks_for_user(request.user)
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
            except Exception as e:
                return Response({'error': str(e)}, status=400)
        return Response({'error': 'No file uploaded'}, status=400)
