package model

// Music 点唱机曲目
type Music struct {
	BaseModel
	MusicName   string `gorm:"type:varchar(100);not null" json:"musicName"`
	MusicAuthor string `gorm:"type:varchar(100);not null;default:''" json:"musicAuthor"`
	MusicUrl    string `gorm:"type:varchar(500);not null" json:"musicUrl"`
	Cover       string `gorm:"type:varchar(500);not null;default:''" json:"cover"`
	Sort        int    `gorm:"not null;default:0" json:"sort"`
	// 不使用 GORM 的 default:1：零值会在 Create 时被数据库默认值覆盖，
	// 导致「新建即停用」的曲目无法保存为 0。默认启用由服务层处理。
	Status int `gorm:"type:smallint;not null;comment:1启用 0停用" json:"status"`
}

func (Music) TableName() string { return "tb_music" }
