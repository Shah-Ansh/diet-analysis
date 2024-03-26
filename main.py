import pandas as pd

# Define a function to calculate score based on difference and recommended range
def calculate_score(difference, recommended_min, recommended_max):
    # Adjust scoring logic as needed (higher score for values within range)
    if difference <= 0:
        return 10  # Perfect score for being within recommended minimum
    elif difference <= (recommended_max - recommended_min) / 2:
        return 8  # Good score for being close to recommended range
    else:
        return 5  # Lower score for exceeding recommended range

# Define weights for each nutrient category (modify as needed)
nutrient_weights = {
    "Animal Protein": 0.06,
    "Vegetal Protein": 0.06,
    "Fat": 0.23,
    "Carbs": 0.525,
    "Sugar": 0.075,
    "Fruits": 0.025,
    "Vegetables": 0.025,
}

# Read recommended daily intake per person (grams) from CSV
recommended_intakes = pd.read_csv("yearwise_nutrients.csv", index_col="Year")
recommended_intakes = recommended_intakes.to_dict("dict")

# Read data from CSV file (assuming the first row contains column names)
data = pd.read_csv("final.csv")

# Create an empty list to store results
results = []

# Loop through each row (country-year) in the DataFrame
for index, row in data.iterrows():
    country = row["Country"]
    year = row["Year"]
    animal_protein = row["Daily caloric intake per person that comes from animal protein"]
    vegetal_protein = row["Daily caloric intake per person that comes from vegetal protein"]
    fat = row["Daily caloric intake per person from fat"]
    carbs = row["Daily caloric intake per person from carbohydrates"]
    sugar = row["Daily caloric intake per person from Sugar & Sweeteners"]
    fruit = row["Daily caloric intake per person that comes from Fruit"]
    vegetables = row["Daily caloric intake per person that comes from Vegetables"]

    # Check if year has recommended values (using try-except for potential missing data)
    try:
        recommended_animal_protein = recommended_intakes["Animal Protein"][year]
        recommended_vegetal_protein = recommended_intakes["Vegetal Protein"][year]
    except KeyError:
        print(f"Warning: Recommended intake data not available for year {year}")
        continue

    recommended_fat = recommended_intakes["Fat"][year]
    recommended_carbs = recommended_intakes["Carbohydrates"][year]
    recommended_sugar = recommended_intakes["Sugar & Sweeteners"][year]
    recommended_fruits = recommended_intakes["Fruit"][year]
    recommended_vegetables = recommended_intakes["Vegetables"][year]

    # Calculate difference from recommended intake for each category
    animal_protein_diff = abs(animal_protein - recommended_animal_protein)
    vegetal_protein_diff = abs(vegetal_protein - recommended_vegetal_protein)
    fat_diff = abs(fat - recommended_fat)
    carbs_diff = abs(carbs - recommended_carbs)
    sugar_diff = abs(sugar - recommended_sugar)
    fruits_diff = abs(fruit - recommended_fruits)
    vegetables_diff = abs(vegetables - recommended_vegetables)
    
    animal_protein_score = 10 - ((animal_protein_diff/(max(animal_protein, recommended_animal_protein)))*10)
    vegetal_protein_score = 10 - ((vegetal_protein_diff/(max(vegetal_protein, recommended_vegetal_protein)))*10)
    fat_score = 10 - ((fat_diff/(max(fat, recommended_fat)))*10)
    carbs_score = 10 - ((carbs_diff/(max(carbs, recommended_carbs)))*10)
    sugar_score = 10 - ((sugar_diff/(max(sugar, recommended_sugar)))*10)
    fruits_score = 10 - ((fruits_diff/(max(fruit, recommended_fruits)))*10)
    vegetables_score = 10 - ((vegetables_diff/(max(vegetables, recommended_vegetables)))*10)
    
    # Calculate weighted score for each category
    weighted_animal_protein_score = animal_protein_score * nutrient_weights["Animal Protein"]
    weighted_vegetal_protein_score = vegetal_protein_score * nutrient_weights["Vegetal Protein"]
    weighted_fat_score = fat_score * nutrient_weights["Fat"]
    weighted_carbs_score = carbs_score * nutrient_weights["Carbs"]
    weighted_sugar_score = sugar_score * nutrient_weights["Sugar"]
    weighted_fruits_score = fruits_score * nutrient_weights["Fruits"]
    weighted_vegetables_score = vegetables_score * nutrient_weights["Vegetables"]

    # Calculate final score by summing weighted scores
    final_score = weighted_animal_protein_score + weighted_vegetal_protein_score + weighted_fat_score + weighted_carbs_score + weighted_sugar_score + weighted_fruits_score + weighted_vegetables_score

    # Append results to the list
    results.append({"Year": year, "Country": country, "Score": final_score})

# Convert the list of results to a DataFrame
results_df = pd.DataFrame(results)

# Write the DataFrame to a CSV file
results_df.to_csv("congrats.csv", index=False)