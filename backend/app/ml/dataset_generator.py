import pandas as pd
import numpy as np

np.random.seed(42)

n = 10000

queue_length = np.random.randint(5, 60, n)
farmers_ahead = np.random.randint(0, 40, n)
active_counters = np.random.randint(1, 6, n)
total_counters = np.random.randint(2, 7, n)
average_processing_time = np.random.uniform(4, 12, n)
quantity = np.random.randint(100, 1000, n)

crop_type = np.random.choice(
    ["Wheat", "Rice", "Maize", "Cotton", "Sugarcane"],
    n
)

centre_capacity = np.random.randint(50, 200, n)
historical_load = np.random.randint(20, 100, n)
time_of_day = np.random.uniform(8, 18, n)
day_of_week = np.random.randint(0, 7, n)

wait_time = (
    farmers_ahead * average_processing_time / active_counters
    + queue_length * 0.3
    + historical_load * 0.1
    - active_counters * 2
    + np.random.normal(0, 3, n)
)

wait_time = np.maximum(wait_time, 1)

data = pd.DataFrame({
    "queue_length": queue_length,
    "farmers_ahead": farmers_ahead,
    "active_counters": active_counters,
    "total_counters": total_counters,
    "average_processing_time": average_processing_time,
    "quantity": quantity,
    "crop_type": crop_type,
    "centre_capacity": centre_capacity,
    "historical_load": historical_load,
    "time_of_day": time_of_day,
    "day_of_week": day_of_week,
    "wait_time": wait_time
})

data.to_csv("dataset.csv", index=False)

print("Dataset created successfully!")
print(data.head())
print("Total rows:", len(data))