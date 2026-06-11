package config

type Config struct {
	Database DatabaseConfig
	JWT      JWTConfig
	Server   ServerConfig
}

type DatabaseConfig struct {
	Type string
}

type JWTConfig struct {
	Secret string
}

type ServerConfig struct {
	Port string
}

var AppConfig *Config

func GetConfig() *Config {
	return AppConfig
}
