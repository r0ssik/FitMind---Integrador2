using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FitMind.BackEnd.SystemInfra.Migrations
{
    /// <inheritdoc />
    public partial class AddMealDayOfWeek : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "DayOfWeek",
                table: "Meals",
                type: "integer",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "DayOfWeek",
                table: "Meals");
        }
    }
}
