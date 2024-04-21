import time
import paramiko





def execute_command_on_server(ip, username, password, setup_vm_command):
    try:
        ssh = paramiko.SSHClient()
        ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
        ssh.connect(ip, username=username, password=password)
        command_str = ' '.join(setup_vm_command)
        stdin, stdout, stderr = ssh.exec_command(command_str)
        print(username)
        output = stdout.readlines()
        errors = stderr.readlines()

        # Do something with the output and errors if needed
        print("Output:", output)
        print("Errors:", errors)

        time.sleep(60)

        ssh.close()
        
        return "Script installation successful."
    except Exception as e:
        return str(e)