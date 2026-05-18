using FitMind.BackEnd.SystemInfra.Entities;
using Microsoft.EntityFrameworkCore;

namespace FitMind.BackEnd.SystemInfra.ContextDb;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    // Auth / User
    public DbSet<User> Users => Set<User>();
    public DbSet<RefreshToken> RefreshTokens => Set<RefreshToken>();
    public DbSet<PasswordResetToken> PasswordResetTokens => Set<PasswordResetToken>();
    public DbSet<UserSettings> UserSettings => Set<UserSettings>();

    // Workout
    public DbSet<WorkoutPlan> WorkoutPlans => Set<WorkoutPlan>();
    public DbSet<WorkoutDay> WorkoutDays => Set<WorkoutDay>();
    public DbSet<Exercise> Exercises => Set<Exercise>();
    public DbSet<WorkoutSession> WorkoutSessions => Set<WorkoutSession>();

    // Diet
    public DbSet<DietPlan> DietPlans => Set<DietPlan>();
    public DbSet<Meal> Meals => Set<Meal>();
    public DbSet<FoodDiaryEntry> FoodDiaryEntries => Set<FoodDiaryEntry>();
    public DbSet<FoodItem> FoodItems => Set<FoodItem>();

    // Progress
    public DbSet<BodyMeasurement> BodyMeasurements => Set<BodyMeasurement>();
    public DbSet<WaterIntake> WaterIntakes => Set<WaterIntake>();

    // Social
    public DbSet<Post> Posts => Set<Post>();
    public DbSet<PostLike> PostLikes => Set<PostLike>();
    public DbSet<Comment> Comments => Set<Comment>();
    public DbSet<Follow> Follows => Set<Follow>();
    public DbSet<Report> Reports => Set<Report>();

    // Challenges / Achievements
    public DbSet<Challenge> Challenges => Set<Challenge>();
    public DbSet<ChallengeParticipant> ChallengeParticipants => Set<ChallengeParticipant>();
    public DbSet<Achievement> Achievements => Set<Achievement>();
    public DbSet<UserAchievement> UserAchievements => Set<UserAchievement>();

    // Notifications
    public DbSet<Notification> Notifications => Set<Notification>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // ── User ─────────────────────────────────────────────
        modelBuilder.Entity<User>(e =>
        {
            e.HasIndex(u => u.Email).IsUnique();
            e.Property(u => u.Weight).HasPrecision(5, 2);
            e.Property(u => u.Height).HasPrecision(5, 2);
        });

        // ── UserSettings — 1-to-1 ────────────────────────────
        modelBuilder.Entity<UserSettings>(e =>
        {
            e.HasOne(s => s.User)
             .WithOne(u => u.Settings)
             .HasForeignKey<UserSettings>(s => s.UserId)
             .OnDelete(DeleteBehavior.Cascade);

            e.HasIndex(s => s.UserId).IsUnique();
        });

        // ── Follow — self-referencing ─────────────────────────
        modelBuilder.Entity<Follow>(e =>
        {
            e.HasOne(f => f.Follower)
             .WithMany(u => u.Following)
             .HasForeignKey(f => f.FollowerId)
             .OnDelete(DeleteBehavior.Restrict);

            e.HasOne(f => f.Following)
             .WithMany(u => u.Followers)
             .HasForeignKey(f => f.FollowingId)
             .OnDelete(DeleteBehavior.Restrict);

            e.HasIndex(f => new { f.FollowerId, f.FollowingId }).IsUnique();
        });

        // ── PostLike — unique per user/post ───────────────────
        modelBuilder.Entity<PostLike>(e =>
            e.HasIndex(pl => new { pl.PostId, pl.UserId }).IsUnique());

        // ── WaterIntake — unique per user/date ───────────────
        modelBuilder.Entity<WaterIntake>(e =>
            e.HasIndex(w => new { w.UserId, w.Date }).IsUnique());

        // ── Report ────────────────────────────────────────────
        modelBuilder.Entity<Report>(e =>
        {
            e.HasOne(r => r.Reporter)
             .WithMany(u => u.Reports)
             .HasForeignKey(r => r.ReporterId)
             .OnDelete(DeleteBehavior.Restrict);
        });

        // ── Decimal precision ─────────────────────────────────
        modelBuilder.Entity<Meal>(e =>
        {
            e.Property(m => m.Proteins).HasPrecision(6, 2);
            e.Property(m => m.Carbs).HasPrecision(6, 2);
            e.Property(m => m.Fats).HasPrecision(6, 2);
        });

        modelBuilder.Entity<BodyMeasurement>(e =>
        {
            e.Property(b => b.Weight).HasPrecision(5, 2);
            e.Property(b => b.BodyFatPercentage).HasPrecision(4, 1);
            e.Property(b => b.MuscleMassPercentage).HasPrecision(4, 1);
            e.Property(b => b.Arm).HasPrecision(4, 1);
            e.Property(b => b.Waist).HasPrecision(4, 1);
            e.Property(b => b.Hip).HasPrecision(4, 1);
            e.Property(b => b.Thigh).HasPrecision(4, 1);
            e.Property(b => b.Chest).HasPrecision(4, 1);
        });

        modelBuilder.Entity<Challenge>(e =>
            e.Property(c => c.Goal).HasPrecision(8, 2));

        modelBuilder.Entity<ChallengeParticipant>(e =>
            e.Property(cp => cp.CurrentProgress).HasPrecision(8, 2));

        modelBuilder.Entity<FoodDiaryEntry>(e =>
        {
            e.Property(f => f.Quantity).HasPrecision(6, 2);
            e.Property(f => f.Proteins).HasPrecision(6, 2);
            e.Property(f => f.Carbs).HasPrecision(6, 2);
            e.Property(f => f.Fats).HasPrecision(6, 2);
        });

        modelBuilder.Entity<FoodItem>(e =>
        {
            e.Property(f => f.ProteinPer100g).HasPrecision(6, 2);
            e.Property(f => f.CarbsPer100g).HasPrecision(6, 2);
            e.Property(f => f.FatsPer100g).HasPrecision(6, 2);
        });
    }

    public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        var entries = ChangeTracker.Entries()
            .Where(e => e.State == EntityState.Modified);

        foreach (var entry in entries)
        {
            if (entry.Entity is Base.BaseEntity entity)
                entity.UpdatedAt = DateTime.UtcNow;
        }

        return base.SaveChangesAsync(cancellationToken);
    }
}
