function generatePassword() {
    var length = 25,
        charset = "abcdefghijklmnopqrstuvwxyz!@#$%^&*0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ",
        retVal = "";
    for (var i = 0, n = charset.length; i < length; ++i) {
        retVal += charset.charAt(Math.floor(Math.random() * n));
    }
    return retVal;
}

for (i = 0; i < 5; i++) {
    console.log("PASSWORD: ", generatePassword())
}