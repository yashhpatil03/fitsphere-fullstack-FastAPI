def generate_recommendations(user, workout_count, average_calories):

    recommendations = []

    # Goal-based recommendations
    if user.goal == "weight_loss":
        recommendations.append(
            "Maintain consistent physical activity."
        )
        recommendations.append(
            "Track your food intake regularly."
        )

    elif user.goal == "muscle_gain":
        recommendations.append(
            "Include strength training in your routine."
        )
        recommendations.append(
            "Include adequate protein in your meals."
        )

    elif user.goal == "maintain":
        recommendations.append(
            "Maintain a balanced workout and nutrition routine."
        )

    else:
        recommendations.append(
            "Set a clear fitness goal to personalize your plan."
        )

    # Activity-based recommendations
    if workout_count == 0:
        recommendations.append(
            "Start with a manageable physical activity routine."
        )

    elif workout_count < 3:
        recommendations.append(
            "Try building a consistent weekly workout schedule."
        )

    else:
        recommendations.append(
            "Continue tracking your activity and recovery."
        )

    # Nutrition-based recommendations
    if average_calories == 0:
        nutrition_tip = "Start recording your daily meals."
    else:
        nutrition_tip = (
            "Review your calorie and nutrition records regularly."
        )

    return {
        "recommendations": recommendations,
        "nutrition_tip": nutrition_tip
    }