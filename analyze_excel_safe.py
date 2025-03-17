import pandas as pd
import sys
import os

def safe_print(text):
    """Print text safely, handling encoding issues"""
    try:
        print(text)
    except UnicodeEncodeError:
        # If there's an encoding error, try to print with a different encoding
        try:
            print(text.encode('utf-8', errors='replace').decode('utf-8'))
        except:
            print("[Content contains characters that cannot be displayed]")

def analyze_excel(file_path):
    """Analyze an Excel file and print information about its sheets and data"""
    try:
        # Read the Excel file
        excel_file = pd.ExcelFile(file_path)
        
        # Get all sheet names
        sheet_names = excel_file.sheet_names
        safe_print(f"\n{'='*80}")
        safe_print(f"Excel file: {os.path.basename(file_path)}")
        safe_print(f"Contains {len(sheet_names)} sheets: {', '.join(sheet_names)}")
        safe_print(f"{'='*80}\n")
        
        # Analyze each sheet
        for sheet in sheet_names:
            try:
                df = pd.read_excel(file_path, sheet_name=sheet)
                
                # Print sheet info
                safe_print(f"\n{'-'*40}")
                safe_print(f"SHEET: {sheet}")
                safe_print(f"{'-'*40}")
                
                # Get basic info
                rows, cols = df.shape
                safe_print(f"Dimensions: {rows} rows × {cols} columns")
                
                # Print column names and data types
                safe_print("\nColumns:")
                for col in df.columns:
                    safe_print(f"  - {col} ({df[col].dtype})")
                
                # Sample data (first 3 rows)
                safe_print("\nSample data (first 3 rows):")
                for i, row in df.head(3).iterrows():
                    safe_print(f"Row {i}:")
                    for col in df.columns:
                        value = row[col]
                        if pd.isna(value):
                            value_str = "NA"
                        else:
                            value_str = str(value)
                            if len(value_str) > 50:
                                value_str = value_str[:47] + "..."
                        safe_print(f"  {col}: {value_str}")
                    safe_print("")
                
                # Summary of data purpose
                safe_print("\nPurpose analysis:")
                if "currency" in sheet.lower():
                    safe_print("  This sheet appears to contain currency exchange rate data")
                elif "cost" in sheet.lower() or "unit" in sheet.lower():
                    safe_print("  This sheet appears to contain cost per unit information")
                elif "opration" in sheet.lower() or "input" in sheet.lower():
                    safe_print("  This sheet appears to contain operational input costs")
                elif "gov" in sheet.lower():
                    safe_print("  This sheet appears to contain government-related costs")
                elif "transport" in sheet.lower():
                    if "local" in sheet.lower():
                        safe_print("  This sheet appears to contain local transportation costs")
                    elif "internat" in sheet.lower():
                        safe_print("  This sheet appears to contain international transportation costs")
                elif "logic" in sheet.lower():
                    safe_print("  This sheet appears to contain business logic and formulas")
                
                # Check for missing values
                missing = df.isnull().sum()
                missing_total = missing.sum()
                if missing_total > 0:
                    safe_print(f"\nMissing values: {missing_total} total")
                
                safe_print(f"\n{'-'*40}\n")
            
            except Exception as e:
                safe_print(f"Error analyzing sheet {sheet}: {str(e)}")
    
    except Exception as e:
        safe_print(f"Error analyzing Excel file: {str(e)}")

if __name__ == "__main__":
    file_path = "sudastock back end.xlsx"
    analyze_excel(file_path)
