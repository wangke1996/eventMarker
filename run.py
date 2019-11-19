from backend import creat_app
import platform

app = creat_app()

if __name__ == "__main__":
    debug = True
    if platform.system().lower() == 'linux':
        debug = False
    app.run(host='0.0.0.0', port=3001, debug=debug)
