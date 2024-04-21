from rest_framework.decorators import api_view
from rest_framework.response import Response
from .utils import execute_command_on_server




@api_view(["POST"])
def add_server(request):
    print(request)
    return Response("Server added successfully", status=200)



@api_view(["POST"])
def start_new_worker(request):
    print(request)
    return Response("Worker started successfully", status=200)


@api_view(["POST"])
def reset_containers_images(request):
    print(request)
    return Response("Reset has been done!", status=200)


@api_view(["POST"])
def start_new_worker(request):
    print(request)
    return Response("Worker started successfully", status=200)

@api_view(["POST"])
def check_status_worker(request):
    print(request)
    return Response("Check has been done successfully", status=200)

@api_view(["POST"])
def restart_server(request):
    print(request)
    return Response("Restart has been done successfully", status=200)


@api_view(["POST"])
def setup_virtual_machine(request):
    print(request.data)
    data = request.data
    ip = data.get('IP')
    username = data.get('username')
    password = data.get('password')
    setup_vm_command = ["lscpu"]
    try:
        result = execute_command_on_server(ip, username, password, setup_vm_command)
        print(result)
        return Response(result, status=200)
    except Exception as e:
        return Response(str(e), status=500)  # Handle specific exceptions as needed
