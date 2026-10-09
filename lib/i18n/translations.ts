export const LANGUAGES = ["en", "es", "es-AR"] as const;
export type Language = (typeof LANGUAGES)[number];

const english = {
  settings:"Settings", general:"General", personalization:"Personalization", nickname:"Username", language:"Language",
  glyphSet:"Glyph set", avatar:"Avatar", theme:"Theme", chest:"Chest", default:"Default", numeric:"Numeric",
  dark:"Dark", light:"Light", pink:"Pink", ocean:"Ocean", previous:"Previous", next:"Next", closeSettings:"Close settings",
  saveChanges:"Save changes", saving:"Saving...", settingsSaved:"Preferences saved.", settingsError:"Could not save settings.",
  welcome:"Welcome", online:"Online", inDevelopment:"In development", store:"Store", ranking:"Ranking", tutorial:"How to play?",
  play:"Play", back:"Back", loading:"Loading...", retry:"Try again", login:"Log in", signup:"Sign up",
  loginTitle:"Log in", loginSubtitle:"Log in to play.", email:"Email", password:"Password", showPassword:"Show password",
  hidePassword:"Hide password", loggingIn:"Logging in...", loginError:"Could not log in", connectionError:"Connection error. Try again.",
  noAccount:"Don't have an account?", createAccount:"Create account", signupSubtitle:"Sign up to play Gemlocks.",
  username:"Username", usernameRequired:"Username is required.", usernameMin:"Must be at least 4 characters.",
  usernameMax:"Must be at most 16 characters.", usernameStart:"Must start with a letter.", usernameChars:"Only lowercase letters and numbers are allowed.",
  passwordRequired:"Password is required.", passwordMin:"Must be at least 8 characters.", passwordMax:"Must be at most 64 characters.",
  passwordSpaces:"Must not contain spaces.", passwordLetter:"Must contain at least one letter.", passwordNumber:"Must contain at least one number.",
  emailRequired:"Email is required.", signupError:"Could not create account.", creating:"Creating...",
  usernameHint:"4–16 characters · starts with a letter · lowercase letters and numbers only",
  passwordHint:"8–64 characters · at least one letter and one number · no spaces",
  rankPoints:"3 points per win · 1 per draw", position:"Rank", player:"Player", victories:"Wins", defeats:"Losses",
  draws:"Draws", points:"Pts.", noPlayers:"There are no players yet.", rankingError:"Could not load the ranking.",
  backPage:"Previous", nextPage:"Next", page:"Page",
} as const;

const spanish = {
  settings:"Ajustes", general:"General", personalization:"Personalización", nickname:"Nombre de usuario", language:"Idioma",
  glyphSet:"Set de glifos", avatar:"Avatar", theme:"Tema", chest:"Cofre", default:"Predeterminado", numeric:"Numérico",
  dark:"Oscuro", light:"Claro", pink:"Rosa", ocean:"Océano", previous:"Anterior", next:"Siguiente", closeSettings:"Cerrar ajustes",
  saveChanges:"Guardar cambios", saving:"Guardando...", settingsSaved:"Preferencias guardadas.", settingsError:"No se pudieron guardar los ajustes.",
  welcome:"Bienvenido/a", online:"Online", inDevelopment:"En desarrollo", store:"Tienda", ranking:"Ranking", tutorial:"¿Cómo se juega?",
  play:"Jugar", back:"Volver", loading:"Cargando...", retry:"Intentar de nuevo", login:"Iniciar sesión", signup:"Registrate",
  loginTitle:"Iniciar sesión", loginSubtitle:"Entrá para jugar.", email:"Correo", password:"Contraseña", showPassword:"Mostrar contraseña",
  hidePassword:"Ocultar contraseña", loggingIn:"Ingresando...", loginError:"No se pudo iniciar sesión", connectionError:"Error de conexión. Intentá de nuevo.",
  noAccount:"¿No tenés cuenta?", createAccount:"Crear cuenta", signupSubtitle:"Registrate para jugar a Gemlocks.",
  username:"Nombre de usuario", usernameRequired:"El nombre de usuario es obligatorio.", usernameMin:"Debe tener al menos 4 caracteres.",
  usernameMax:"Debe tener como máximo 16 caracteres.", usernameStart:"Debe comenzar con una letra.", usernameChars:"Solo puede contener letras minúsculas y números.",
  passwordRequired:"La contraseña es obligatoria.", passwordMin:"Debe tener al menos 8 caracteres.", passwordMax:"Debe tener como máximo 64 caracteres.",
  passwordSpaces:"No puede contener espacios.", passwordLetter:"Debe contener al menos una letra.", passwordNumber:"Debe contener al menos un número.",
  emailRequired:"El correo es obligatorio.", signupError:"No se pudo crear la cuenta.", creating:"Creando...",
  usernameHint:"4–16 caracteres · empieza con letra · solo letras minúsculas y números",
  passwordHint:"8–64 caracteres · al menos una letra y un número · sin espacios",
  rankPoints:"3 puntos por victoria · 1 por empate", position:"Puesto", player:"Jugador", victories:"Vict.", defeats:"Der.",
  draws:"Emp.", points:"Pts.", noPlayers:"Todavía no hay jugadores.", rankingError:"No se pudo cargar el ranking.",
  backPage:"Atrás", nextPage:"Siguiente", page:"Página",
} as const;

export const translations = { en: english, es: spanish, "es-AR": { ...spanish, nickname:"Nick" } };
export type TranslationKey = keyof typeof english;
