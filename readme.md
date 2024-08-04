# Gestor de Gastos Compartidos

## Descripción

Esta aplicación web permite a los usuarios gestionar y dividir gastos compartidos entre múltiples participantes. Facilita el ingreso de transacciones, la asignación de gastos a diferentes personas y el cálculo automático de los totales por participante.

## Características

- Registro e inicio de sesión de usuarios
- Gestión dinámica de participantes
- Ingreso y análisis de transacciones
- Asignación flexible de gastos a múltiples participantes
- Cálculo automático de totales por participante
- Interfaz de usuario intuitiva y responsive
- Soporte para múltiples divisas
- Búsqueda y filtrado de transacciones
- Asignación automática de participantes basada en transacciones similares

## Tecnologías Utilizadas

- Backend: Python con Flask
- Frontend: HTML, CSS, JavaScript
- Base de datos: SQLite
- Autenticación: Flask-Session

## Configuración del Proyecto

1. Clona el repositorio:
   ```
   git clone [URL del repositorio]
   ```
2. Navega al directorio del proyecto:
   ```
   cd gestor-gastos-compartidos
   ```
3. Crea un entorno virtual:
   ```
   python -m venv venv
   ```
4. Activa el entorno virtual:
   - En Windows: `venv\Scripts\activate`
   - En macOS y Linux: `source venv/bin/activate`
5. Instala las dependencias:
   ```
   pip install -r requirements.txt
   ```
6. Inicializa la base de datos:
   ```
   flask init-db
   ```

## Ejecución de la Aplicación

1. Asegúrate de que el entorno virtual esté activado.
2. Ejecuta la aplicación Flask:
   ```
   flask run
   ```
3. Abre un navegador y ve a `http://localhost:5000`

## Uso

1. Regístrate o inicia sesión en la aplicación.
2. Añade participantes en la sección "Gestión de Participantes".
3. Selecciona las divisas principal y secundaria.
4. Ingresa las transacciones en el formato especificado en la sección "Ingreso de Transacciones".
5. Haz clic en "Añadir Transacciones" para procesar las entradas.
6. Revisa y ajusta las asignaciones de participantes en la tabla de transacciones.
7. Utiliza la barra de búsqueda para filtrar transacciones específicas.
8. Consulta el resumen de gastos actualizado automáticamente.

## Estructura del Proyecto

- `app.py`: Archivo principal de la aplicación Flask
- `schema.sql`: Esquema de la base de datos
- `static/`: Directorio para archivos estáticos (CSS, JavaScript)
- `templates/`: Directorio para plantillas HTML
- `requirements.txt`: Lista de dependencias del proyecto

## Contribuciones

Las contribuciones son bienvenidas. Por favor, abre un issue para discutir cambios mayores antes de crear un pull request.

## Licencia

[Incluir información de licencia aquí]
