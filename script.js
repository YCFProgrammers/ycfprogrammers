document.addEventListener('DOMContentLoaded', () => {
    const button = document.getElementById('mostrar-codigo');
    const codigoContenido = document.getElementById('codigo-contenido');

    const codigo = `
#include <AFMotor.h>
#include <Servo.h>
#include <Wire.h>
#include <LiquidCrystal_I2C.h>
#include <DHT.h>

// Motores DC
AF_DCMotor motor1(1);
AF_DCMotor motor2(2);
AF_DCMotor motor3(3);
AF_DCMotor motor4(4);

// Motor Servo
Servo gripperServo;
const int servoPin = 10;
bool isGripperOpen = false;

// Ultrasonido
const int trigPin = 7;
const int echoPin = 6;
long duration;
int distance;

// Buzzer
const int buzzerPin = 9;

// DHT11
#define DHTPIN 5     // Pin donde está conectado el DHT11
#define DHTTYPE DHT11   // Tipo de sensor DHT11
DHT dht(DHTPIN, DHTTYPE);

// LCD I2C
LiquidCrystal_I2C lcd(0x27, 16, 2);  // Dirección I2C de la pantalla LCD

void setup() {
    Serial.begin(9600);
    Serial.setTimeout(100);

    // Configuración de motores DC
    motor1.setSpeed(250);
    motor2.setSpeed(250);
    motor3.setSpeed(250);
    motor4.setSpeed(250);

    // Configuración del servo
    gripperServo.attach(servoPin);
    gripperServo.write(0);  // Inicializar pinza en posición cerrada

    // Configuración del ultrasonido
    pinMode(trigPin, OUTPUT);
    pinMode(echoPin, INPUT);
    
    // Configuración del buzzer
    pinMode(buzzerPin, OUTPUT);
    
    // Inicializar el sensor DHT11
    dht.begin();
    
    // Inicializar la pantalla LCD
    lcd.init();
    lcd.backlight();  // Activar la retroiluminación
    lcd.setCursor(0, 0);
    lcd.print("Iniciando...");
}

void loop() {
    if (Serial.available() > 0) {
        char codeReceived = Serial.read();

        switch (codeReceived) {
            case 'F': goForward(); break;
            case 'L': turnLeft(); break;
            case 'B': goBack(); break;
            case 'R': turnRight(); break;
            case 'S': stopMotors(); break;
            case 'G': servoantebrazoopen(); break;
            case 'C': servoantebrazoclose(); break;
            case 'N': Servo2(); break;
        }

        while (Serial.available() > 0) {
            Serial.read();  // Limpia el buffer
        }
    }

    // Medir distancia con el sensor ultrasónico
    distance = measureDistance();
    
    // Si la distancia es menor a 20 cm, activar el buzzer
    if (distance > 0 && distance < 20) {
        digitalWrite(buzzerPin, HIGH);  // Encender buzzer
    } else {
        digitalWrite(buzzerPin, LOW);   // Apagar buzzer
    }

    // Leer datos del sensor DHT11
    float humidity = dht.readHumidity();
    float temperature = dht.readTemperature();
    
    // Mostrar datos en la pantalla LCD
    lcd.setCursor(0, 0);
    lcd.print("Temp: ");
    lcd.print(temperature);
    lcd.print("C");

    lcd.setCursor(0, 1);
    lcd.print("Hum:  ");
    lcd.print(humidity);
    lcd.print("%");

    // Pequeño retardo para refrescar los datos cada 2 segundos
    delay(2000);
}

// Funciones de control de motores DC
void goForward() {
    motor1.run(RELEASE);
    motor2.run(FORWARD);
    motor3.run(FORWARD);
    motor4.run(RELEASE);
}

void turnLeft() {
    motor1.run(RELEASE);
    motor2.run(RELEASE);
    motor3.run(FORWARD);
    motor4.run(BACKWARD);
}

void goBack() {
    motor1.run(RELEASE);
    motor2.run(BACKWARD);
    motor3.run(BACKWARD);
    motor4.run(RELEASE);
}

void turnRight() {
    motor1.run(BACKWARD);
    motor2.run(FORWARD);
    motor3.run(RELEASE);
    motor4.run(RELEASE);
}

void stopMotors() {
    motor1.run(RELEASE);
    motor2.run(RELEASE);
    motor3.run(RELEASE);
    motor4.run(RELEASE);
}

// Función para controlar la pinza (servo)
void servoantebrazoopen() {
  gripperServo.write(0);  // Mover a la posición 0 grados (abrir)
}

void servoantebrazoclose() {
  gripperServo.write(110);  // Mover a la posición cerrada
}

void Servo2() {
  gripperServo.write(60);
}

// Función para medir la distancia con el sensor ultrasónico
int measureDistance() {
    digitalWrite(trigPin, LOW);
    delayMicroseconds(2);
    digitalWrite(trigPin, HIGH);
    delayMicroseconds(10);
    digitalWrite(trigPin, LOW);

    duration = pulseIn(echoPin, HIGH);
    int distance = duration * 0.034 / 2;  // Calcula la distancia en cm
    return distance;
}
`;

    button.addEventListener('click', () => {
        codigoContenido.textContent = codigo;
        codigoContenido.style.display = codigoContenido.style.display === 'block' ? 'none' : 'block';
    });
});
