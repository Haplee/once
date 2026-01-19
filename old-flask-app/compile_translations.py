from babel.messages.frontend import CommandLineInterface

if __name__ == '__main__':
    CommandLineInterface().run(['pybabel', 'compile', '-d', 'api/translations'])
