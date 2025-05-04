from flask import Flask, render_template, request, redirect, url_for, session, flash
import sqlite3
import os

app = Flask(__name__)
app.secret_key = 'clave_secreta'  # Para manejar sesiones

# Inicializa base de datos si no existe
def init_db():
    if not os.path.exists("users.db"):
        with sqlite3.connect("users.db") as conn:
            cursor = conn.cursor()
            cursor.execute('''
                CREATE TABLE users (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    username TEXT UNIQUE NOT NULL,
                    password TEXT NOT NULL
                )
            ''')

# Página de inicio
@app.route('/')
def inicio():
    return redirect(url_for('login'))

# Login
@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        usuario = request.form['username']
        clave = request.form['password']
        with sqlite3.connect("users.db") as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM users WHERE username=? AND password=?", (usuario, clave))
            usuario_encontrado = cursor.fetchone()
            if usuario_encontrado:
                session['username'] = usuario
                return redirect('/html/Proyectos.html')  # Puedes cambiar la ruta si deseas
            else:
                flash("Usuario o contraseña incorrectos.")
    return render_template('Login.html')

# Registro
@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        usuario = request.form['username']
        clave = request.form['password']
        try:
            with sqlite3.connect("users.db") as conn:
                cursor = conn.cursor()
                cursor.execute("INSERT INTO users (username, password) VALUES (?, ?)", (usuario, clave))
                conn.commit()
                flash("Registro exitoso. Inicia sesión.")
                return redirect(url_for('login'))
        except sqlite3.IntegrityError:
            flash("El usuario ya existe.")
    return render_template('register.html')

# Logout
@app.route('/logout')
def logout():
    session.pop('username', None)
    return redirect(url_for('login'))

# Inicializa la base de datos
init_db()

if __name__ == '__main__':
    app.run(debug=True)
