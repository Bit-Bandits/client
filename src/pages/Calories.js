import React, { useEffect, useState } from "react"; // Imports React libraries as well as useEffect and useState
import { useNavigate } from "react-router-dom";
import Auth from "../utils/auth";
import { useMutation, useQuery } from "@apollo/client";
import { SAVE_MEAL } from "../utils/mutations";
import { GET_MEAL_BY_USERNAME_AND_DATE } from "../utils/queries";
import { REMOVE_FOOD } from "../utils/mutations";

import {getUsernameFromToken, getFormattedDate} from '../utils/helpers';

function Calories() {
  const [foodData, setFoodData] = useState([]);
  const [savedFoods, setSavedFoods] = useState([]); // new state variable for saved foods
  const [food, setFood] = useState("");
  const [totalCalories, setTotalCalories] = useState(0); // new state variables for adding total calories
  const [currentDate, setCurrentDate] = useState("");
  const [noFoodDataSearch, setNoFoodDataSearch] = useState("");

  const Navigate = useNavigate();

  const [saveMeal] = useMutation(SAVE_MEAL, {
    refetchQueries: [
      {
        query: GET_MEAL_BY_USERNAME_AND_DATE,
        variables: {
          username: getUsernameFromToken(),
          date: getFormattedDate(),
        },
      },
    ],
  });

  const [removeFood] = useMutation(REMOVE_FOOD, {
    refetchQueries: [
      {
        query: GET_MEAL_BY_USERNAME_AND_DATE,
        variables: {
          username: getUsernameFromToken(),
          date: getFormattedDate(),
        },
      },
    ],
  });

  // targets the value(food) in which the user is looking for
  const handleFoodChange = (event) => {
    setFood(event.target.value);
  };

  // handles the submit in our search to fetch data from api
  const handleFormSubmit = (event) => {
    event.preventDefault();
    setFoodData([]); // clear previous results
    fetchFoodData();
  };

  useEffect(() => {}, [food]);

  //Gets Date
  useEffect(() => {
    const formattedDate = new Date().toLocaleString();
    setCurrentDate(formattedDate);
  }, []);


  const fetchFoodData = async () => {
   
    const apiUrl = `https://api.edamam.com/api/food-database/v2/parser?ingr=${encodeURIComponent(food)}&app_id=314fbe88&app_key=25dfafdd8b307eb5f55d06bca92f4d08`;
    console.log("apiUrl:", apiUrl);
    try {
      const response = await fetch(apiUrl);
      const data = await response.json();
      if (data.hints && data.hints.length > 0) {
        const firstHint = data.hints[0];
        setFoodData([{ ...firstHint, servings: 1 }]);
        setNoFoodDataSearch("");
      } else {
        setNoFoodDataSearch("No search results: Please try again!");
        console.log('did not return data');
        setFoodData([]);
      }
      
   
    } catch (e) {
      console.log(e);
    }
  };

  const handleDeleteFood = async (foodToDelete) => {
    try {
      await removeFood({
        variables: {
          id: foodToDelete._id,
        },
      });
      setSavedFoods(
        savedFoods.filter((meals) => meals._id !== foodToDelete._id)
      );
    } catch (error) {
      console.error("Error deleting food:", error);
      console.log("food to delete:", foodToDelete);
    }
  };

  const handleServingsChange = (index, value) => {
    setFoodData(
      foodData.map((item, i) =>
        i === index ? { ...item, servings: value } : item
      )
    );
  };

  const { loading, error, data } = useQuery(GET_MEAL_BY_USERNAME_AND_DATE, {
    variables: {
      username: getUsernameFromToken(),
      date: getFormattedDate(),
    },
  });

  const mealsFromDatabase = data?.getMealsByUsernameAndDate;

  
  useEffect(() => {
 
    let total = 0;
    mealsFromDatabase?.forEach(meal => {
      total = total + meal.calories
    })

    console.log(total);

    setTotalCalories(total)
  }, [mealsFromDatabase]);

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>Error: {error.message}</p>;
  }


  const handleSaveFood = async (food) => {
    //Gets userId from Token
    const username = getUsernameFromToken();
    console.log("username:", username);

    const formattedDate = getFormattedDate();
    console.log("date:", formattedDate);

    const calories = Math.round(food.food.nutrients.ENERC_KCAL * food.servings);

    const savedFood = {
      food: food.food.label,
      calories,
      servings: parseInt(food.servings),
    };

    console.log("food:", savedFood.food);
    console.log("calories:", savedFood.calories);
    console.log("servings:", savedFood.servings);

    setSavedFoods([...savedFoods, mealsFromDatabase]);
    console.log("saved foods:", savedFoods);

    // Saves username, food, calories, servings, and data to database
    try {
      const { data } = await saveMeal({
        variables: {
          username,
          food: savedFood.food,
          calories,
          servings: savedFood.servings,
          date: parseInt(formattedDate),
        },
      });
      console.log("Save meal response:", data);
    } catch (error) {
      console.error("Error saving meal:", error);
    }
  };

  const goToDashboard = () => {
    Navigate("/dashboard");
  };

  const list = foodData.map((food, index) => {
    const calories = Math.round(food.food.nutrients.ENERC_KCAL * food.servings);
    return (
      <li className="calorie-item" key={food.food.foodId}>
        <img src={food.food.image} alt={food.food.label} className="food-img" />{" "}
        {food.food.label} | Calories: {calories}
        {Auth.loggedIn() ? (
          <>
            <input
              type="number"
              value={food.servings}
              onChange={(e) => handleServingsChange(index, e.target.value)}
              min="1"
            />
            <button onClick={() => handleSaveFood(food)}>Save</button>
          </>
        ) : null}
       
      </li>
    );
  });

 

  const savedFoodList = mealsFromDatabase.map((meals) => {
    return (
      <li key={meals._id} className="meal-item">
        {meals.food} | Servings: {meals.servings} | Calories:{" "}
        {Math.round(meals.calories)}
        <button className="delete-button" onClick={() => handleDeleteFood(meals)}>Delete</button>
      </li>
    );
  });

  return (
    <div className="foods-container">
      <div className="search-results">
        <form className="search-form" onSubmit={handleFormSubmit}>
          <input
            id="food-search"
            type="text"
            value={food}
            onChange={handleFoodChange}
            placeholder="Search for a food..."
          />
          <button type="submit">Search</button>
        </form>
        <h4 style={{ color: 'red' }}>{noFoodDataSearch}</h4>
        <ul>{list}</ul>
      </div>

      <div className="saved-foods">
        <h2>Current Date: {currentDate}</h2>
        <h3>Saved Foods</h3>
        <ul>
          {savedFoodList}
        </ul>
        <h3 className="calorie-total">Total Calores: {totalCalories}</h3>
        <button onClick={goToDashboard}>Go to Dashboard</button>
      </div>
    </div>
  );
}

export default Calories;
    