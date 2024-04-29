import json
from collections import deque

# Load buildings and edges data from JSON files
with open("buildings.JSON", "r") as f:
    buildings = json.load(f)

with open("edges.JSON", "r") as f:
    edges = json.load(f)

# Create a dictionary to map building names to their node IDs
building_ids = {building["name"]: building["node_id"] for building in buildings}

# Create a dictionary to map node IDs to building names
building_names = {building["node_id"]: building["name"] for building in buildings}

# Build a graph from the edges data
graph = {}
for edge in edges:
    source = edge["source"]
    targets = {target["id"]: target["distance"] for target in edge["targets"]}
    graph[source] = targets

def bfs(graph, start, end):
    visited = set()
    queue = deque([(start, [])])

    while queue:
        current_node, path = queue.popleft()
        visited.add(current_node)

        if current_node == end:
            return path + [current_node]

        for neighbor, _ in graph.get(current_node, {}).items():
            if neighbor not in visited:
                queue.append((neighbor, path + [current_node]))

    return None

# Get input from the user
start_building_name = input("Enter the name of the start building: ")
end_building_name = input("Enter the name of the destination building: ")

# Check if the provided building names are valid
if start_building_name not in building_ids or end_building_name not in building_ids:
    print("Invalid building names.")
else:
    start_node_id = building_ids[start_building_name]
    end_node_id = building_ids[end_building_name]

    # Find the shortest path
    shortest_path = bfs(graph, start_node_id, end_node_id)

    if shortest_path:
        path_names = [building_names[node_id] for node_id in shortest_path]
        print("Shortest path:", " -> ".join(path_names))
    else:
        print("No path found between the specified buildings.")
