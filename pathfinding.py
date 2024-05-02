import json
from collections import deque, defaultdict


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


def dfs(graph, start, end, visited=None, path=None):
    if visited is None:
        visited = set()
    if path is None:
        path = []

    visited.add(start)
    path = path + [start]

    if start == end:
        return path

    for neighbor, _ in graph.get(start, {}).items():
        if neighbor not in visited:
            new_path = dfs(graph, neighbor, end, visited, path)
            if new_path:
                return new_path

    return None


def dijkstra(graph, start, end):
    distances = defaultdict(lambda: float('inf'))
    distances[start] = 0
    visited = set()
    queue = [(0, [start])]  # Queue now contains both distance and path

    while queue:
        current_distance, path = queue.pop(0)
        current_node = path[-1]

        if current_node == end:
            return current_distance, path  # Return both distance and path

        if current_node in visited:
            continue

        visited.add(current_node)

        for neighbor, weight in graph.get(current_node, {}).items():
            distance = current_distance + weight
            new_path = path + [neighbor]  # Extend the current path
            if distance < distances[neighbor]:
                distances[neighbor] = distance
                queue.append((distance, new_path))

    return None, None  # If no path is found



def main():
    # Load data from JSON files
    with open('edges.json', 'r') as f:
        edges_data = json.load(f)

    with open('buildings.json', 'r') as f:
        buildings_data = json.load(f)

    # Create a dictionary of node names and their corresponding IDs
    name_to_id = {building['name']: building['node_id'] for building in buildings_data}

    # Create a graph from the edges data
    graph = defaultdict(dict)

    for edge in edges_data:
        source_id = edge['source']
        for target in edge['targets']:
            target_id = target['id']
            weight = target['distance']
            graph[source_id][target_id] = weight

    # Get start and end building names from the user
    start_building_name = input("Enter the name of the start building: ")
    end_building_name = input("Enter the name of the destination building: ")

    # Get start and end node IDs
    start_node_id = name_to_id.get(start_building_name)
    end_node_id = name_to_id.get(end_building_name)

    # Perform pathfinding
    if start_node_id is not None and end_node_id is not None:
        bfs_path = bfs(graph, start_node_id, end_node_id)
        dfs_path = dfs(graph, start_node_id, end_node_id)
        dijkstra_distance = dijkstra(graph, start_node_id, end_node_id)

        # Print the results
        if bfs_path:
            print("Shortest path (BFS):", ' -> '.join([buildings_data[node_id - 1]['name'] for node_id in bfs_path]))
        else:
            print("No path found (BFS)")

        if dfs_path:
            print("Shortest path (DFS):", ' -> '.join([buildings_data[node_id - 1]['name'] for node_id in dfs_path]))
        else:
            print("No path found (DFS)")

        if dijkstra_distance is not None:
            print("Shortest distance (Dijkstra):", dijkstra_distance)
        else:
            print("No path found (Dijkstra)")
    else:
        print("Building not found in the dataset.")


if __name__ == "__main__":
    main()
