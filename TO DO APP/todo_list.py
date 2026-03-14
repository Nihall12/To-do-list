import sys

class Task:
    def __init__(self, title, priority, estimate, completed=False):
        self.title = title
        self.priority = priority.capitalize()
        self.estimate = estimate
        self.completed = completed

    def __repr__(self):
        checkbox = "[x]" if self.completed else "[ ]"
        return f"{checkbox} {self.title:<30} | Priority: {self.priority:<7} | Est: {self.estimate}"

def sort_tasks(tasks):
    priority_order = {"High": 0, "Medium": 1, "Low": 2}
    return sorted(tasks, key=lambda x: priority_order.get(x.priority, 3))

def display_todo_list(tasks):
    print("\n" + "="*70)
    print(f"{'DAILY TO-DO LIST':^70}")
    print("="*70)
    
    sorted_tasks = sort_tasks(tasks)
    
    current_priority = None
    for task in sorted_tasks:
        if task.priority != current_priority:
            current_priority = task.priority
            print(f"\n--- {current_priority} Priority ---")
        print(task)
    
    print("="*70 + "\n")

if __name__ == "__main__":
    # Suggested realistic tasks for a productive day
    daily_tasks = [
        Task("Review urgent emails", "High", "30 mins"),
        Task("Complete core project module", "High", "3 hours"),
        Task("Team sync meeting", "Medium", "45 mins"),
        Task("Document new features", "Medium", "1 hour"),
        Task("Organize workspace", "Low", "20 mins"),
        Task("Check industry news", "Low", "15 mins"),
        Task("Plan tasks for tomorrow", "Medium", "15 mins"),
        Task("Respond to Slack messages", "High", "20 mins")
    ]
    
    # Simulate some completed tasks
    daily_tasks[0].completed = True
    daily_tasks[7].completed = True
    
    display_todo_list(daily_tasks)
