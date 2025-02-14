// Intution: The current time of day is a value from 0.0 to 1.0
// Turns out this is correct. It resets at midnight from 1.0 to 0.0.
// Finding the value in CE is easy enough.
// CE scan for float bigger than 0
// CE continue scan for float less than 1
// CE continue scan for incresed value 
// continue until theres like 1200ish values, one will stick out from all the
// others (because all the others will be the same).
// When the time resets from 1 to 0 you can scan for that as well to be sure.
// Find what writes to the value.
// fstp dword ptr [eax+0Ch]
// Open this method in IDA and see that it is called 18 times.
// Thats 17 times too many for me to want to figure out the interesting calls.
// Since the function is small, we can replace it with something that just sets 
// [eax+0Ch] to our desired time of day.

// Set this to your desired time of day (any number, from 0 to 24 will work, 
// including decimal values so if you want 7:35 to be your time of day, just
// set it to 7.35).
var desiredTimeOfDay = 12.0;



// mov eax, [ecx] is from the original function. We move the hex representation
// of our floating point time of day (0.0 - 1.0) to eax+0Ch then return.
var thePatch = [
    0x8B, 0x01,                                 // mov eax, [ecx]
    0xC7, 0x40, 0x0C, 0xFF, 0xFF, 0xFF, 0xFF,   // mov [eax+0Ch], 0xFFFFFFFF 
    0xC2, 0x04, 0x00                            // retn 4
];

// The original set time of day function that we found (the one called 18 
// times).
var setTimeOfDay = scan('55 8B EC 8B 01 D9 45 08 D9 58 0C');

patch(setTimeOfDay, thePatch);

// We aren't done yet though, we need to replace the placeholder 0xFFFFFFFF with 
// the desired time of day.
var buf = new ArrayBuffer(4);
var bytes = new Uint8Array(buf);
var floats = new Float32Array(buf);

floats[0] = desiredTimeOfDay / 24.0;

patch(setTimeOfDay.add(5), Array.from(bytes));
