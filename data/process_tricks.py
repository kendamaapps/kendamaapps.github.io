import os
import re
import json
from pathlib import Path

# Reference dictionary mapping event acronyms to their full names
EVENT_REFERENCE = {
    "KWC": "Kendama World Cup",
    "TKO": "Taiwan Kendama Open",
    "BATB": "Battle At The Border",
    "NAKO": "North American Kendama Open",
}

def parse_trick_files(folder_path):
    structured_data = []
    folder = Path(folder_path)
    
    # Pattern to match filename: {event}_{year}.txt
    filename_pattern = re.compile(r"^(?P<event>.+)_(?P<year>\d{4})\.txt$")
    
    # Pattern to strip out the number prefix like "01-01: " from trick names
    trick_prefix_pattern = re.compile(r"^\d+-\d+:\s*")

    # Iterate through all files in the folder
    for file_path in folder.glob("*.txt"):
        match = filename_pattern.match(file_path.name)
        if not match:
            continue
            
        # Extract the raw event string and format it to ALL CAPS for key lookup
        event_raw = match.group("event").strip().upper()
        year = int(match.group("year"))
        
        # Check against our reference dictionary, otherwise default to the capitalized acronym
        event_name = EVENT_REFERENCE.get(event_raw, event_raw)
        
        # Initialize event dictionary
        event_entry = {
            "event": event_name,
            "year": year,
            "tricks": {}
        }
        
        # Read file contents
        with open(file_path, "r", encoding="utf-8") as f:
            content = f.read()
            
        # Standardize newlines and split blocks by double newlines
        blocks = [b.strip() for b in re.split(r'\n\s*\n', content) if b.strip()]
        
        for block in blocks:
            lines = block.splitlines()
            if not lines:
                continue
                
            # Convert division/level name to Title Case (e.g., "Level 01")
            division_name = lines[0].strip().title()
            
            # Extract and clean the trick names from the remaining lines
            tricks_list = []
            for line in lines[1:]:
                cleaned_line = line.strip()
                if cleaned_line:
                    # Remove bullet points if any exist (e.g., "* 01-01: Trick")
                    cleaned_line = re.sub(r'^\*\s*', '', cleaned_line)
                    # Strip out the "01-01:" prefix
                    cleaned_line = trick_prefix_pattern.sub("", cleaned_line)
                    # Convert the individual trick name string to Title Case
                    tricks_list.append(cleaned_line.strip().title())
            
            if tricks_list:
                event_entry["tricks"][division_name] = tricks_list
                
        structured_data.append(event_entry)
        
    return structured_data

def main():
    # Set the working directory to the directory where this script is saved
    script_dir = os.path.dirname(os.path.abspath(__file__))
    os.chdir(script_dir)
    print(f"Working directory changed to: {os.getcwd()}")

    input_folder = "processed_tricklists"
    output_file = "structured_tricks.json"
    
    # Check if folder exists in the current working directory
    if not os.path.exists(input_folder):
        print(f"Error: Folder '{input_folder}' does not exist relative to the script location.")
        return
        
    # Process files
    result = parse_trick_files(input_folder)
    
    # Save to JSON
    with open(output_file, "w", encoding="utf-8") as json_file:
        json.dump(result, json_file, indent=2, ensure_ascii=False)
        
    print(f"Successfully processed {len(result)} files and saved to {output_file}")

if __name__ == "__main__":
    main()