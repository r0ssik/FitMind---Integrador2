using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FitMind.BackEnd.SystemInfra.Migrations
{
    /// <inheritdoc />
    public partial class FixChallengeRelationship : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Challenges_Users_CreatedById",
                table: "Challenges");

            migrationBuilder.DropIndex(
                name: "IX_Challenges_CreatedById",
                table: "Challenges");

            migrationBuilder.DropColumn(
                name: "CreatedById",
                table: "Challenges");

            migrationBuilder.CreateIndex(
                name: "IX_Challenges_CreatedByUserId",
                table: "Challenges",
                column: "CreatedByUserId");

            migrationBuilder.AddForeignKey(
                name: "FK_Challenges_Users_CreatedByUserId",
                table: "Challenges",
                column: "CreatedByUserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Challenges_Users_CreatedByUserId",
                table: "Challenges");

            migrationBuilder.DropIndex(
                name: "IX_Challenges_CreatedByUserId",
                table: "Challenges");

            migrationBuilder.AddColumn<Guid>(
                name: "CreatedById",
                table: "Challenges",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.CreateIndex(
                name: "IX_Challenges_CreatedById",
                table: "Challenges",
                column: "CreatedById");

            migrationBuilder.AddForeignKey(
                name: "FK_Challenges_Users_CreatedById",
                table: "Challenges",
                column: "CreatedById",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
