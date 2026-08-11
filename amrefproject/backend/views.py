from rest_framework import viewsets

from .models import Task
from .serializers import TaskSerializer


class TaskViewSet(viewsets.ModelViewSet):
    """
    Provides list, create, retrieve, update, partial_update, destroy
    for Task, all wired automatically by the router in urls.py.
    """

    queryset = Task.objects.all()
    serializer_class = TaskSerializer
