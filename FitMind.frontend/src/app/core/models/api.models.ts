// ── Auth ──────────────────────────────────────────────────────────────────────

export interface LoginRequest { email: string; password: string; }

export interface RegisterRequest {
  name: string; email: string; password: string;
  phone: string; birthDate: string; sex: string;
  weight: number; height: number; limitations: string;
  goals: string; weeklyAvailability: number;
}

export interface UserInfoDto { id: string; name: string; email: string; isAdmin: boolean; }

export interface LoginResponse {
  accessToken: string; refreshToken: string; expiresAt: string; user: UserInfoDto;
}

export interface RefreshTokenRequest { accessToken: string; refreshToken: string; }
export interface ForgotPasswordRequest { email: string; }
export interface ResetPasswordRequest { token: string; newPassword: string; }

// ── User ─────────────────────────────────────────────────────────────────────

export interface UserDto {
  id: string; name: string; email: string; phone: string;
  birthDate: string; sex: string; weight: number; height: number;
  bio?: string;
  avatarUrl?: string;
  limitations?: string;
  goals?: string;
  isAdmin: boolean; isActive: boolean; createdAt: string;
}

export interface UpdateUserDto {
  name?: string; phone?: string; bio?: string; avatarUrl?: string;
  weight?: number;
  height?: number;
  limitations?: string;
  goals?: string;
  sex?: string;       // enum name: Male | Female | NonBinary | NotInformed
  birthDate?: string; // ISO date: YYYY-MM-DD
}

// ── Workout ──────────────────────────────────────────────────────────────────

export interface ExerciseDto {
  id: string; name: string; sets: number; reps: string;
  restTime: string; effortLevel: number; tips?: string;
}

export interface WorkoutDayDto {
  id: string; dayName: string; focus: string; orderIndex: number;
  exercises: ExerciseDto[];
}

export interface WorkoutPlanDto {
  id: string; name: string; goal: string; daysPerWeek: number; weeks: number;
  isAiGenerated: boolean; createdAt: string; days: WorkoutDayDto[];
}

export interface CreateWorkoutPlanRequest {
  name: string; goal: string; daysPerWeek: number; weeks: number;
  experienceLevel?: string; location?: string;
  days?: CreateWorkoutDayRequest[];
}

export interface CreateWorkoutDayRequest {
  dayName: string; focus: string; orderIndex: number;
  exercises: CreateExerciseRequest[];
}

export interface CreateExerciseRequest {
  name: string; sets: number; reps: string; restTime: string;
  effortLevel: number; tips?: string; orderIndex: number;
}

export interface LogWorkoutSessionRequest {
  workoutPlanId?: string; date: string; durationMinutes: number;
  feeling?: string; notes?: string;
  workoutDayName?: string; workoutFocus?: string;
  exercisesTotal?: number; setsTotal?: number;
}

export interface WorkoutHistoryDto {
  id: string; date: string; name: string; focus?: string;
  durationMinutes: number; exercisesTotal: number; setsTotal: number; feeling?: string;
}

export interface AiGenerateWorkoutRequest {
  daysPerWeek: number; minutesPerSession: number; location: string;
  preferences: string[]; limitations: string[];
}

// ── Diet ─────────────────────────────────────────────────────────────────────

export interface MealDto {
  id: string; name: string; time: string; calories: number;
  proteins: number; carbs: number; fats: number; description?: string;
  dayOfWeek?: number; // null/undefined = todos os dias; 0=Seg … 6=Dom
}

export interface DietPlanDto {
  id: string; name: string; goal: string; budget?: string;
  restrictions?: string; dailyCalories: number; isAiGenerated: boolean;
  createdAt: string; meals: MealDto[];
}

export interface CreateMealRequest {
  name: string; time: string; calories: number;
  proteins: number; carbs: number; fats: number; description?: string;
  dayOfWeek?: number; // null/undefined = todos os dias; 0=Seg … 6=Dom
}

export interface CreateDietPlanRequest {
  name: string; goal: string; budget?: string; restrictions?: string;
  dailyCalories?: number; isAiGenerated?: boolean;
  meals?: CreateMealRequest[];
}

export interface LogFoodEntryRequest {
  date: string; mealType: string; foodName: string; quantity: number;
  unit: string; calories: number; proteins: number; carbs: number; fats: number;
}

export interface DietHistoryDto {
  date: string; totalCalories: number; calorieGoal: number;
  totalProtein: number; totalCarbs: number; totalFat: number;
}

export interface AiGenerateDietRequest {
  goal: string; budget: string; mealsPerDay: number;
  restrictions: string[]; foodPreferences: string[];
}

// ── Food ─────────────────────────────────────────────────────────────────────

export interface PortionDto { label: string; grams: number; }

export interface FoodItemDto {
  id: string; name: string; brand?: string;
  caloriesPer100g: number; proteinPer100g: number; carbsPer100g: number; fatsPer100g: number;
  commonPortions: PortionDto[];
}

export interface FoodCalculatedDto {
  foodId: string; name: string; grams: number;
  calories: number; protein: number; carbs: number; fat: number;
}

export interface DetectedFoodDto {
  name: string; confidencePercent: number; grams: number;
  calories: number; protein: number; carbs: number; fat: number;
}

export interface ImageAnalysisResultDto {
  detectedFoods: DetectedFoodDto[];
  totalCalories: number; totalProtein: number; totalCarbs: number; totalFat: number;
}

// ── Progress ─────────────────────────────────────────────────────────────────

export interface DashboardProgressDto {
  todayWorkoutName?: string; todayWorkoutDone: number; todayWorkoutTotal: number;
  todayCalories: number; calorieGoal: number;
  waterCups: number; waterGoal: number; weightDeltaThisMonth?: number;
}

export interface WeightEntryDto { date: string; value: number; }
export interface MeasurementChartDto { date: string; waist?: number; hip?: number; chest?: number; }
export interface WorkoutBarDto { label: string; durationMinutes: number; exercises: number; }

export interface ChartDataDto {
  weightHistory: WeightEntryDto[];
  measurementHistory: MeasurementChartDto[];
  workoutBars: WorkoutBarDto[];
}

export interface ProgressStatsDto {
  currentWeight?: number; startWeight?: number; weightDelta?: number;
  currentBodyFat?: number; totalWorkouts: number; workoutsThisMonth: number;
  currentStreak: number; bestStreak: number; avgWorkoutMinutes: number;
  totalCaloriesThisWeek: number; calorieGoal: number;
}

export interface AddWeightRequest { date: string; value: number; }

// ── Measurement ───────────────────────────────────────────────────────────────

export interface MeasurementDto {
  id: string; date: string; weight?: number; bodyFatPercentage?: number;
  muscleMassPercentage?: number; arm?: number; waist?: number; hip?: number;
  thigh?: number; chest?: number; notes?: string;
}

export interface CreateMeasurementRequest {
  date: string; weight?: number; bodyFatPercentage?: number;
  muscleMassPercentage?: number; arm?: number; waist?: number; hip?: number;
  thigh?: number; chest?: number; notes?: string;
}

// ── Water ─────────────────────────────────────────────────────────────────────

export interface WaterIntakeDto { date: string; cups: number; goal: number; }
export interface SetWaterCupsRequest { cups: number; }

// ── Social ───────────────────────────────────────────────────────────────────

export interface PostDto {
  id: string; userId: string; userName: string; userAvatarUrl?: string;
  content: string; tags?: string; imageUrl?: string;
  likesCount: number; commentsCount: number; isLikedByCurrentUser: boolean; createdAt: string;
}

export interface CreatePostRequest { content: string; tags?: string; imageUrl?: string; }

export interface CommentDto {
  id: string; userId: string; userName: string; content: string; createdAt: string;
}

export interface CreateCommentRequest { content: string; }

// ── Challenge ─────────────────────────────────────────────────────────────────

export interface ChallengeParticipantDto {
  userId: string; name: string; initials: string;
  currentProgress: number; progressPercent: number; rank: number;
}

export interface ChallengeDto {
  id: string; name: string; description: string; type: string;
  goal: number; unit: string; startDate: string; endDate: string;
  daysLeft: number; createdByName: string; participantCount: number;
  participants: ChallengeParticipantDto[]; myProgress?: number; isParticipating: boolean;
  icon?: string;
}

export interface CreateChallengeRequest {
  name: string; description: string; type: string; goal: number;
  unit: string; startDate: string; endDate: string;
}

export interface UpdateChallengeProgressRequest { progress: number; }

// ── Notification ─────────────────────────────────────────────────────────────

export interface NotificationDto {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
  actionRoute?: string;
}
// ── Achievement ───────────────────────────────────────────────────────────────

export interface AchievementDto {
  id: string; name: string; description: string; category: string;
  icon: string; points: number; unlocked: boolean; unlockedAt?: string; progress?: number;
  rare?: boolean;
}

// ── History ───────────────────────────────────────────────────────────────────

export interface AchievementHistoryDto {
  id: string; unlockedAt: string; icon: string; name: string; category: string; points: number;
}

export interface FullHistoryDto {
  workouts: WorkoutHistoryDto[];
  diet: DietHistoryDto[];
  achievements: AchievementHistoryDto[];
}

// ── Profile ───────────────────────────────────────────────────────────────────

export interface BadgeDto { icon: string; title: string; isRare: boolean; }

export interface ActivityDto { icon: string; text: string; occurredAt: string; tag: string; }

export interface PublicProfileDto {
  id: string; name: string; initials: string; bio?: string; avatarUrl?: string;
  followersCount: number; followingCount: number; totalWorkouts: number;
  currentStreak: number; isFollowing: boolean; isMe: boolean;
  badges: BadgeDto[]; recentActivity: ActivityDto[];
}

// ── Settings ──────────────────────────────────────────────────────────────────

export interface UserSettingsDto {
  notifWorkout: boolean; notifDiet: boolean; notifWater: boolean;
  notifChallenge: boolean; notifSocial: boolean; notifAchievement: boolean;
  publicProfile: boolean; showActivity: boolean; showWeight: boolean;
  theme: string; language: string; calorieGoal: number; waterGoalCups: number;
}

export interface UpdateSettingsDto {
  notifWorkout?: boolean; notifDiet?: boolean; notifWater?: boolean;
  notifChallenge?: boolean; notifSocial?: boolean; notifAchievement?: boolean;
  publicProfile?: boolean; showActivity?: boolean; showWeight?: boolean;
  theme?: string; language?: string; calorieGoal?: number; waterGoalCups?: number;
}

// ── Admin ─────────────────────────────────────────────────────────────────────

export interface WeeklyActiveDto { day: string; count: number; }

export interface DashboardStatsDto {
  totalUsers: number; activeToday: number; newThisWeek: number;
  workoutsToday: number; activeChallenges: number; openReports: number;
  weeklyActivity: WeeklyActiveDto[];
}

export interface AdminUserDto {
  id: string; name: string; email: string; initials: string;
  joinedAt: string; totalWorkouts: number; status: string;
}

export interface ReportDto {
  id: string; reporterName: string; targetType: string; targetId: string;
  reason: string; status: string; createdAt: string;
}

export interface UpdateReportStatusDto { status: string; }
