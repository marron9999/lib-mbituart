//% weight=10 color=#008B00 icon="\uf2db" block="mbituart"
namespace lib_mbituart {

export let value = {
    Button : { A: 0, B: 0, L:0, P0:0, P1:0, P2:0 },
    LightLevel : 0,
    Temperature : 0,
    MagneticForce : { X: 0, Y: 0, Z: 0 },
    Acceleration : { X: 0, Y: 0, Z: 0 },
    Rotation : { R: 0, P: 0 },
    Gesture : "",
}

export let request = {
    Microbit : 0,
    MagneticForce : 0,
    Acceleration : 0,
    Rotation : 0,
    sleep: 50
}

export function setupAudio() {
    pins.digitalWritePin(DigitalPin.P0, 0)
    //pins.analogSetPitchPin(AnalogPin.P0)
    pins.setAudioPin(AnalogPin.P0)
    pins.analogWritePin(AnalogPin.P0, 0)
}

//music.onEvent(MusicEvent.MelodyEnded, function () {
//    if(received.length > 0) received += "," 
//    received += "RTM"
//})

/**
 * Start micro:bit sensor service
 */
//% blockId=mbituart_start block="Start mbituart |%sleep "
//% sleep.defl=50 sleep.min=0 sleep.max=1000
//% weight=95
function start(sleep = 50) {
    request.sleep = sleep
    lib_mbitlink.reseter(reset)
    lib_mbitlink.reciver(parse)
    basic.forever(function () {
        inspect()
        if(request.sleep > 0)
            basic.pause(request.sleep)
    })
}

export function reset() {
    request.Microbit = 0
    request.MagneticForce = 0
    request.Acceleration = 0
    request.Rotation = 0
}

function R(str : string) : boolean{
    let c = str.charAt(0)
    str = str.substr(1)
    if (c == "C") {
        input.calibrateCompass()
        return true
    }
    if (c == "M") {
        request.Microbit = parseInt(str)
        return true
    }
    if (c == "F") {
        request.MagneticForce = parseInt(str)
        return true
    }
    if (c == "G") {
        request.Acceleration = parseInt(str)
        return true
    }
    if (c == "R") {
        request.Rotation = parseInt(str)
        return true
    }
    return false
}

function C(str : string) {
    let c = str.charAt(0)
    str = str.substr(1)
    if (c == "T") {
        basic.clearScreen()
        if (str.length <= 0) {
            return
        }
        basic.showString(str)
        return
    }
    if (c == "0") {
        let y = parseInt(str.charAt(0))
        let x = parseInt(str.charAt(1))
        led.unplot(x, y)
        return
    }
    if (c == "1") {
        let y = parseInt(str.charAt(0))
        let x = parseInt(str.charAt(1))
        led.plot(x, y)
        return
    }
    if (c == "M") {
        basic.clearScreen()
        let y = 0
        while (y < str.length) {
            let v = "0123456789ABCDEFGHIJKLMNOPQRSTUV".indexOf(str.charAt(y))
            if ((v & 16) != 0) led.plot(0, y)
            if ((v & 8) != 0) led.plot(1, y)
            if ((v & 4) != 0) led.plot(2, y)
            if ((v & 2) != 0) led.plot(3, y)
            if ((v & 1) != 0) led.plot(4, y)
            y++
        }
        return
    }
}

function T(str : string) {
    let c = str.charAt(0)
    str = str.substr(1)
    if (c == "T") {
        bluetooth.uartWriteString("DTS")
        pins.digitalWritePin(DigitalPin.P0, 0)
        pins.setAudioPin(AnalogPin.P0)
        new SoundExpression(str).playUntilDone()
        pins.analogWritePin(AnalogPin.P0, 0)
        bluetooth.uartWriteString("DTE")
        return
    }
//    if (c == "M") {
//        cv = parseInt(str)
//        music.startMelody(music.getMelody(cv), MelodyOptions.Once)
//        return
//    }
    let v = parseInt(str)
    let w = music.beat(BeatFraction.Sixteenth)
    if (c == "1") w = music.beat(BeatFraction.Whole)
    else if (c == "2") w = music.beat(BeatFraction.Half)
    else if (c == "4") w = music.beat(BeatFraction.Quarter)
    else if (c == "8") w = music.beat(BeatFraction.Eighth)
    music.playTone(v, w)
}

function parse(str : string) : boolean {
    let c = str.charAt(0)
    str = str.substr(1)
    if (c == "T") {
        T(str)
        return true
    }
    if (c == "C") {
        C(str)
        return true
    }
    if (c == "G") {
        let g = str.charAt(1)
        let v = AcceleratorRange.EightG
        if (g == "1") v = AcceleratorRange.OneG
        else if (g == "2") v = AcceleratorRange.TwoG
        else if (g == "4") v = AcceleratorRange.FourG
        input.setAccelerometerRange(v)
        return true
    }
    if (c == "R") {
        return R(str)
    }
    return false
}

function inspect() {
    if ((request.Microbit & 1) != 0) {
        let m = ""
        let v = 0
        if (input.buttonIsPressed(Button.A)) v = 1
        if (value.Button.A != v) {
            value.Button.A = v
            m += ",BA" + value.Button.A
        }
        v = 0
        if (input.buttonIsPressed(Button.B)) v = 1
        if (value.Button.B != v) {
            value.Button.B = v
            m += ",BB" + value.Button.B
        }
        v = 0
        if (input.logoIsPressed()) v = 1
        if (value.Button.L != v) {
            value.Button.L = v
            m += ",BL" + value.Button.L
        }
        if (m.length > 0) {
            bluetooth.uartWriteString(m.substr(1))
        }
    }
    if ((request.Microbit & 8) != 0) {
        let m = ""
        let v = pins.digitalReadPin(DigitalPin.P0);
        if (value.Button.P0 != v) {
            value.Button.P0 = v
            m += ",B0" + value.Button.P0
        }
        v = pins.digitalReadPin(DigitalPin.P1);
        if (value.Button.P1 != v) {
            value.Button.P1 = v
            m += ",B1" + value.Button.P1
        }
        v = pins.digitalReadPin(DigitalPin.P2);
        if (value.Button.P2 != v) {
            value.Button.P2 = v
            m += ",B2" + value.Button.P2
        }
        if (m.length > 0) {
            bluetooth.uartWriteString(m.substr(1))
        }
    }
    if ((request.Microbit & 2) != 0) {
        let v = input.temperature()
        if (value.Temperature != v) {
            value.Temperature = v
            bluetooth.uartWriteString("T-" + value.Temperature)
        }
    }
    if ((request.Microbit & 4) != 0) {
        let v = input.lightLevel()
        if (value.LightLevel != v) {
            value.LightLevel = v
            bluetooth.uartWriteString("V-" + value.LightLevel)
        }
    }
    if ((request.Microbit & 16) != 0) {
        let v = ""
        if(input.isGesture(Gesture.EightG)) v = "8G"
        else if(input.isGesture(Gesture.FreeFall)) v = "FreeFall"
        else if(input.isGesture(Gesture.LogoDown)) v = "LogoDown"
        else if(input.isGesture(Gesture.LogoUp)) v = "LogoUp"
        else if(input.isGesture(Gesture.ScreenDown)) v = "ScreenDown"
        else if(input.isGesture(Gesture.ScreenUp)) v = "ScreenUp"
        else if(input.isGesture(Gesture.Shake)) v = "Shake"
        else if(input.isGesture(Gesture.SixG)) v = "6G"
        else if(input.isGesture(Gesture.ThreeG)) v = "3G"
        else if(input.isGesture(Gesture.TiltLeft)) v = "TiltLeft"
        else if(input.isGesture(Gesture.TiltRight)) v = "TiltRight"
        if (value.Gesture != v) {
            value.Gesture = v
            bluetooth.uartWriteString("G-" + value.Gesture)
        }
    }
    if (request.MagneticForce != 0) {
        let x = input.magneticForce(Dimension.X)
        let y = input.magneticForce(Dimension.Y)
        let z = input.magneticForce(Dimension.Z)
        if (request.MagneticForce != 1) {
            x = Math.floor(x / request.MagneticForce) * request.MagneticForce
            y = Math.floor(y / request.MagneticForce) * request.MagneticForce
            z = Math.floor(z / request.MagneticForce) * request.MagneticForce
        }
        if (value.MagneticForce.X != x
            || value.MagneticForce.Y != y
            || value.MagneticForce.Z != z) {
            value.MagneticForce.X = x
            value.MagneticForce.Y = y
            value.MagneticForce.Z = z
            bluetooth.uartWriteString("F-"
                + lib_mbitlink.int16_hex(value.MagneticForce.X)
                + lib_mbitlink.int16_hex(value.MagneticForce.Y)
                + lib_mbitlink.int16_hex(value.MagneticForce.Z))
        }
    }
    if (request.Acceleration != 0) {
        let x = input.acceleration(Dimension.X)
        let y = input.acceleration(Dimension.Y)
        let z = input.acceleration(Dimension.Z)
        if (request.Acceleration != 1) {
            x = Math.floor(x / request.Acceleration) * request.Acceleration
            y = Math.floor(y / request.Acceleration) * request.Acceleration
            z = Math.floor(z / request.Acceleration) * request.Acceleration
        }
        if (value.Acceleration.X != x
            || value.Acceleration.Y != y
            || value.Acceleration.Z != z) {
            value.Acceleration.X = x
            value.Acceleration.Y = y
            value.Acceleration.Z = z
            bluetooth.uartWriteString("G-"
                + lib_mbitlink.int16_hex(value.Acceleration.X)
                + lib_mbitlink.int16_hex(value.Acceleration.Y)
                + lib_mbitlink.int16_hex(value.Acceleration.Z))
        }
    }
    if (request.Rotation != 0) {
        let r = input.rotation(Rotation.Roll)
        let p = input.rotation(Rotation.Pitch)
        if (request.Rotation != 1) {
            r = Math.floor(r / request.Rotation) * request.Rotation
            p = Math.floor(p / request.Rotation) * request.Rotation
        }
        if (value.Rotation.R != r || value.Rotation.P != p) {
            value.Rotation.R = r
            value.Rotation.P = p
            bluetooth.uartWriteString("R-"
                + lib_mbitlink.int16_hex(value.Rotation.R)
                + lib_mbitlink.int16_hex(value.Rotation.P))
        }
    }
}

}
