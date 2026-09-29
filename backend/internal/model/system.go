package model

// Menu 菜单
type Menu struct {
	BaseModel
	Name      string `gorm:"type:varchar(20);not null" json:"name"`
	Path      string `gorm:"type:varchar(50);not null" json:"path"`
	Component string `gorm:"type:varchar(50);not null" json:"component"`
	Icon      string `gorm:"type:varchar(50);not null" json:"icon"`
	OrderNum  int    `gorm:"type:smallint;not null" json:"orderNum"`
	ParentID  *int   `json:"parentId"`
	IsHidden  bool   `gorm:"not null;default:false" json:"isHidden"`
}

func (Menu) TableName() string { return "tb_menu" }

// Resource API 资源（用于 RBAC 权限控制）
type Resource struct {
	BaseModel
	ResourceName  string  `gorm:"type:varchar(50);not null" json:"resourceName"`
	URL           *string `gorm:"type:varchar(255)" json:"url"`
	RequestMethod *string `gorm:"type:varchar(10)" json:"requestMethod"`
	ParentID      *int    `json:"parentId"`
	IsAnonymous   bool    `gorm:"not null;default:false;comment:是否允许匿名访问" json:"isAnonymous"`
}

func (Resource) TableName() string { return "tb_resource" }

// RoleMenu 角色-菜单关联
type RoleMenu struct {
	ID     int `gorm:"primaryKey;autoIncrement" json:"id"`
	RoleID int `gorm:"not null;index" json:"roleId"`
	MenuID int `gorm:"not null;index" json:"menuId"`
}

func (RoleMenu) TableName() string { return "tb_role_menu" }

// RoleResource 角色-资源关联
type RoleResource struct {
	ID         int `gorm:"primaryKey;autoIncrement" json:"id"`
	RoleID     int `gorm:"not null;index" json:"roleId"`
	ResourceID int `gorm:"not null;index" json:"resourceId"`
}

func (RoleResource) TableName() string { return "tb_role_resource" }

// Page 自定义页面
type Page struct {
	BaseModel
	PageName  string `gorm:"type:varchar(10);not null" json:"pageName"`
	PageLabel string `gorm:"type:varchar(20)" json:"pageLabel"`
	PageCover string `gorm:"type:varchar(255);not null" json:"pageCover"`
}

func (Page) TableName() string { return "tb_page" }

// WebsiteConfig 站点配置
type WebsiteConfig struct {
	BaseModel
	Config string `gorm:"type:text;comment:JSON格式的站点配置" json:"config"`
}

func (WebsiteConfig) TableName() string { return "tb_website_config" }

// OperationLog 操作日志
type OperationLog struct {
	BaseModel
	OptModule     string `gorm:"type:varchar(20);not null" json:"optModule"`
	OptType       string `gorm:"type:varchar(20);not null" json:"optType"`
	OptURL        string `gorm:"type:varchar(255);not null" json:"optUrl"`
	OptMethod     string `gorm:"type:varchar(255);not null" json:"optMethod"`
	OptDesc       string `gorm:"type:varchar(255);not null" json:"optDesc"`
	RequestParam  string `gorm:"type:text;not null" json:"requestParam"`
	RequestMethod string `gorm:"type:varchar(20);not null" json:"requestMethod"`
	ResponseData  string `gorm:"type:text;not null" json:"responseData"`
	UserID        int    `gorm:"not null" json:"userId"`
	Nickname      string `gorm:"type:varchar(50);not null" json:"nickname"`
	IPAddress     string `gorm:"type:varchar(255);not null" json:"ipAddress"`
	IPSource      string `gorm:"type:varchar(255)" json:"ipSource"`
}

func (OperationLog) TableName() string { return "tb_operation_log" }

// UniqueView 访客统计
type UniqueView struct {
	BaseModel
	ViewsCount int `gorm:"not null;default:0" json:"viewsCount"`
}

func (UniqueView) TableName() string { return "tb_unique_view" }

// About 个人信息（用于「关于」页面，由管理员维护后展示给访客）
//
// 单行表设计：整站只有一份「关于我」，用 First/Init 取第一行；不存在时 Init 一条空记录，
// 这样无需在前端处理「配置尚未初始化」的分支，简化读写语义。
type About struct {
	BaseModel
	Avatar        string `gorm:"type:varchar(1024);not null;default:''" json:"avatar"`
	Nickname      string `gorm:"type:varchar(50);not null" json:"nickname"`
	Intro         string `gorm:"type:varchar(255)" json:"intro"`
	Bio           string `gorm:"type:text" json:"bio"`
	Email         string `gorm:"type:varchar(100)" json:"email"`
	Website       string `gorm:"type:varchar(255)" json:"website"`
	Github        string `gorm:"type:varchar(255)" json:"github"`
	TechStack     string `gorm:"type:text" json:"techStack"`
	BackendSkills string `gorm:"type:text" json:"backendSkills"`
	FrontendSkills string `gorm:"type:text" json:"frontendSkills"`
	OtherSkills   string `gorm:"type:text" json:"otherSkills"`
}

func (About) TableName() string { return "tb_about" }
