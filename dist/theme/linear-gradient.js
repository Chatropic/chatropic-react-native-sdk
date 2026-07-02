export function loadLinearGradient() {
    try {
        return require("expo-linear-gradient").LinearGradient;
    }
    catch {
        return null;
    }
}
