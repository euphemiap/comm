int val = 0;       // variable to store the value coming from the sensor

void setup() {

}

void loop() {
  val = analogRead(0);    // read the value from the sensor
  Serial.println(val);
}
