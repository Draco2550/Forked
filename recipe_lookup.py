import requests

# @TODO Search for a meal by name

url = "https://www.themealdb.com/api/json/v1/1/filter.php?i=banana"
response = requests.get(url)

if response.status_code == 200:
    data = response.json()
    meals = data.get("meals")
    if meals:
        meal = meals[0]
        print("Meal:", meal["strMeal"])
        print("Category:", meal["strCategory"])
        print("Instructions:", meal["strInstructions"][:200], "...")
        print("Thumbnail:", meal["strMealThumb"])
    else:
        print("No meals found.")
else:
    print("Error:", response.status_code)