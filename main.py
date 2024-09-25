from flask import Flask, request, render_template_string, redirect, url_for

app = Flask(__name__)

# Lista para almacenar los datos ingresados
data_store = []

# Plantilla HTML para el formulario y mostrar datos
html_template = """
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Formulario de Datos</title>
</head>
<body>
    <h1>Ingresar Datos</h1>
    <form action="{{ url_for('submit_data') }}" method="post">
        <label for="name">Nombre:</label><br>
        <input type="text" id="name" name="name" required><br><br>

        <label for="age">Edad:</label><br>
        <input type="number" id="age" name="age" required><br><br>

        <input type="submit" value="Enviar">
    </form>

    <h2>Datos Guardados</h2>
    <ul>
        {% for item in data_store %}
            <li><strong>Nombre:</strong> {{ item['name'] }}, <strong>Edad:</strong> {{ item['age'] }}</li>
        {% endfor %}
    </ul>
</body>
</html>
"""

@app.route('/', methods=['GET'])
def index():
    """Renderiza el formulario HTML y muestra los datos guardados."""
    return render_template_string(html_template, data_store=data_store)

@app.route('/submit', methods=['POST'])
def submit_data():
    """Maneja la solicitud POST para ingresar nuevos datos."""
    name = request.form.get('name')
    age = request.form.get('age')

    if name and age:
        # Añadir los datos ingresados a la lista
        data_store.append({'name': name, 'age': age})

    return redirect(url_for('index'))

if __name__ == '__main__':
    app.run(debug=True)
