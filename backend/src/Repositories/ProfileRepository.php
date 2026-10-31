<?php

declare(strict_types=1);

namespace App\Repositories;

use App\Core\Database;

final class ProfileRepository extends Repository
{
    public function findByUser(int $userId): array
    {
        $row = $this->db->one('SELECT * FROM user_profiles WHERE user_id = ?', [$userId]);
        return [
            'education' => $row['education'] ?? null,
            'current_position' => $row['current_position'] ?? null,
            'career_goal' => $row['career_goal'] ?? null,
            'profile_data' => self::decode($row['profile_data'] ?? null) ?? new \stdClass(),
            'updated_at' => self::iso($row['updated_at'] ?? null),
        ];
    }

    public function upsert(int $userId, ?string $education, ?string $position, ?string $goal, array $data): void
    {
        $now = Database::now();
        $this->db->run(
            'INSERT INTO user_profiles (user_id, education, current_position, career_goal, profile_data, created_at, updated_at)
             VALUES (?, ?, ?, ?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE education = VALUES(education), current_position = VALUES(current_position),
                career_goal = VALUES(career_goal), profile_data = VALUES(profile_data), updated_at = VALUES(updated_at)',
            [$userId, $education, $position, $goal, self::encode((object) $data), $now, $now],
        );
    }

    public function clear(int $userId): void
    {
        $this->db->run('DELETE FROM user_profiles WHERE user_id = ?', [$userId]);
    }
}
