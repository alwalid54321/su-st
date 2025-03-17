import pandas as pd
import sys
from pprint import pprint

def analyze_excel(file_path):
    """Analyze an Excel file and print information about its sheets and data"""
    try:
        # Read the Excel file
        excel_file = pd.ExcelFile(file_path)
        
        # Get all sheet names
        sheet_names = excel_file.sheet_names
        print(f"\n{'='*80}")
        print(f"Excel file: {file_path}")
        print(f"Contains {len(sheet_names)} sheets: {', '.join(sheet_names)}")
        print(f"{'='*80}\n")
        
        # Analyze each sheet
        for sheet in sheet_names:
            df = pd.read_excel(file_path, sheet_name=sheet)
            
            # Print sheet info
            print(f"\n{'-'*40}")
            print(f"SHEET: {sheet}")
            print(f"{'-'*40}")
            
            # Get basic info
            rows, cols = df.shape
            print(f"Dimensions: {rows} rows × {cols} columns")
            
            # Print column names and data types
            print("\nColumns:")
            for col in df.columns:
                print(f"  - {col} ({df[col].dtype})")
            
            # Sample data (first 5 rows)
            print("\nSample data (first 5 rows):")
            print(df.head().to_string())
            
            # Summary statistics for numeric columns
            numeric_cols = df.select_dtypes(include=['number']).columns
            if len(numeric_cols) > 0:
                print("\nNumeric column statistics:")
                print(df[numeric_cols].describe().to_string())
            
            # Check for missing values
            missing = df.isnull().sum()
            if missing.sum() > 0:
                print("\nMissing values by column:")
                for col, count in missing.items():
                    if count > 0:
                        print(f"  - {col}: {count} missing values")
            
            print(f"\n{'-'*40}\n")
    
    except Exception as e:
        print(f"Error analyzing Excel file: {e}")

if __name__ == "__main__":
    file_path = "sudastock back end.xlsx"
    analyze_excel(file_path)
