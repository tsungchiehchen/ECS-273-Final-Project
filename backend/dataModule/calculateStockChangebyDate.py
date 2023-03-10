import pandas as pd
import csv
import json
import numpy as np
import matplotlib.pyplot as plt
from scipy import stats as st


def getdataframe():
    df = pd.read_csv('./dataset/Stocks Symbols.csv')

    # select mid, large, and mega market cap
    df = df.loc[df['Market_Cap'] > 2000000000.00]

    # get columns name: Symbol, Market_Cap, Sector
    df = df.loc[:, ["Symbol", "Market_Cap", "Sector"]]

    return df


def getStocksChange(symbol, start_date, end_date):
    df = pd.read_csv('./dataset/Historical Price/' + symbol + '.csv')

    # First, check if the stock is listed before the start date
    # if not let the change = None
    ipo_date = df.iloc[0]["Date"]
    ipo_year = ipo_date[0:4]
    ipo_month = ipo_date[5:7]
    start_year = start_date[0:4]
    start_month = start_date[5:7]

    if (ipo_year <= start_year) or (ipo_year == start_year and ipo_month < start_month):
        # check if the start or end date is weekend or holiday
        start_date = df.loc[df["Date"] >= start_date, "Date"].iloc[0]
        end_date = df.loc[df["Date"] >= end_date, "Date"].iloc[0]

        start_price = df.loc[df["Date"] == start_date]["Close"].values[0]
        end_price = df.loc[df["Date"] == end_date]["Close"].values[0]

        # Lastly, calculate price change
        change = round(((end_price - start_price) / start_price) * 100, 2)
    else:
        change = None

    return change


def get_percentile(changes):
    # Use min and max to get interval
    # minimum, maximum = min(changes), max(changes)
    # portion_separate_values = [0 for _ in range(7)]
    # n = len(portion_separate_values)
    # if (minimum + maximum) < 12:
    #     interval = int(max(maximum, minimum) / 3)
    # else:
    #     interval = int(round((minimum + maximum) / 2 / 6, 0))

    # Use mode to get interval
    # interval = st.mode(changes).mode[0]
    # print(interval)
    # portion_separate_values = [0 for _ in range(7)]
    # n = len(portion_separate_values)

    # Use median to get interval
    interval = np.median(changes)
    portion_separate_values = [0 for _ in range(7)]
    n = len(portion_separate_values)

    for i in range(1, 4):
        portion_separate_values[(n//2) - i] = -1 * interval * i
        portion_separate_values[(n//2) + i] = interval * i

    return portion_separate_values


def writetoCSV(objects):
    # field names
    fields = ['sector', 'name', 'rate', 'market cap']
    filename = "./dataset/stockData.csv"

    with open(filename, 'w') as csvfile:
        writer = csv.DictWriter(csvfile, fieldnames=fields)

        writer.writeheader()

        writer.writerows(objects)


def convertCSVtoJSON():
    df = pd.read_csv('./dataset/stockData.csv')

    tech_children = []
    consumer_discretionary_children = []
    health_care_children = []
    finance_children = []
    industrials_children = []
    consumer_staples_children = []
    utilities_children = []
    energy_children = []
    telecommunications_children = []
    real_estate_children = []
    miscellaneous_children = []
    basic_materials_children = []

    # process children in each sector
    for i in range(len(df)):
        sector = df.iloc[i]["sector"]
        name = df.iloc[i]["name"]
        rate = df.iloc[i]["rate"]
        value = df.iloc[i]["market cap"]
        d = {}
        d['rate'] = rate
        d['name'] = name
        d['value'] = value

        if sector == "Technology":
            tech_children.append(d)
        elif sector == "Health Care":
            health_care_children.append(d)
        elif sector == "Consumer Discretionary":
            consumer_discretionary_children.append(d)
        elif sector == "Finance":
            finance_children.append(d)
        elif sector == "Industrials":
            industrials_children.append(d)
        elif sector == "Consumer Staples":
            consumer_staples_children.append(d)
        elif sector == "Utilities":
            utilities_children.append(d)
        elif sector == "Energy":
            energy_children.append(d)
        elif sector == "Telecommunications":
            telecommunications_children.append(d)
        elif sector == "Real Estate":
            real_estate_children.append(d)
        elif sector == "Miscellaneous":
            miscellaneous_children.append(d)
        elif sector == "Basic Materials":
            basic_materials_children.append(d)

    # add each sector name to its children
    tech_sector_result = {}
    tech_sector_result["name"] = "Technology"
    tech_sector_result["children"] = tech_children

    consumer_disct_result = {}
    consumer_disct_result["name"] = "Consumer Discretionary"
    consumer_disct_result["children"] = consumer_discretionary_children

    health_care_result = {}
    health_care_result["name"] = "Health Care"
    health_care_result["children"] = health_care_children

    finance_result = {}
    finance_result["name"] = "Finance"
    finance_result["children"] = finance_children

    industrials_result = {}
    industrials_result["name"] = "Industrials"
    industrials_result["children"] = industrials_children

    consumer_staples_result = {}
    consumer_staples_result["name"] = "Consumer Staples"
    consumer_staples_result["children"] = consumer_staples_children

    utilities_result = {}
    utilities_result["name"] = "Utilities"
    utilities_result["children"] = utilities_children

    energy_result = {}
    energy_result["name"] = "Energy"
    energy_result["children"] = energy_children

    telecommunications_result = {}
    telecommunications_result["name"] = "Telecommunications"
    telecommunications_result["children"] = telecommunications_children

    real_estate_result = {}
    real_estate_result["name"] = "Real Estate"
    real_estate_result["children"] = real_estate_children

    miscellaneous_result = {}
    miscellaneous_result["name"] = "Miscellaneous"
    miscellaneous_result["children"] = miscellaneous_children

    basic_materials_result = {}
    basic_materials_result["name"] = "Basic Materials"
    basic_materials_result["children"] = basic_materials_children

    # add all sector to overall market
    overall_market = {}

    overall_market_children = []
    overall_market_children.append(tech_sector_result)
    overall_market_children.append(consumer_disct_result)
    overall_market_children.append(health_care_result)
    overall_market_children.append(finance_result)
    overall_market_children.append(industrials_result)
    overall_market_children.append(consumer_staples_result)
    overall_market_children.append(utilities_result)
    overall_market_children.append(energy_result)
    overall_market_children.append(telecommunications_result)
    overall_market_children.append(real_estate_result)
    overall_market_children.append(miscellaneous_result)
    overall_market_children.append(basic_materials_result)

    overall_market["name"] = "MARKET"
    overall_market["children"] = overall_market_children

    return json.dumps(overall_market, indent=4)


def processAllStocksChange(start_date, end_date):
    df = getdataframe()

    all_changes = []
    changes = []
    for i in range(len(df)):
        symbol = df.iloc[i]["Symbol"]
        sector = df.iloc[i]["Sector"]
        marketCap = df.iloc[i]["Market_Cap"]

        change = getStocksChange(symbol, start_date, end_date)

        if change != None:
            # store in dict
            d = {}
            d['sector'] = sector
            d['name'] = symbol
            d['rate'] = change
            # normalize Market_Cap by dividing 10^9
            d['market cap'] = marketCap / (10 ** 9)
            changes.append(change)
            all_changes.append(d)

    # calculate percentile (of 6 portions)
    percentiles = get_percentile(changes)

    writetoCSV(all_changes)
    change_in_json = convertCSVtoJSON()
    file = open('../frontend/flask/static/stockData.json', 'w')
    file.write(change_in_json)
    file.close()
    return percentiles


################################## TESTING #########################################
# # normal input test
# start_date = "2017-01-01"
# end_date = "2018-01-01"
# print("From: " + start_date, " To: " + end_date)
# jsonFile, percentiles = processAllStocksChange(start_date, end_date)
# print(percentiles)
# print()


# # test end date invalid (auto correct end date)
# start_date = "2017-01-01"
# end_date = "2018-01-21"
# print("From: " + start_date, " To: " + end_date)
# jsonFile, percentiles = processAllStocksChange(start_date, end_date)
# print(percentiles)
# print()

# # test date invalid 2 (auto correct end date)
# start_date = "2021-01-01"
# end_date = "2021-03-01"
# print("From: " + start_date, " To: " + end_date)
# jsonFile, percentiles = processAllStocksChange(start_date, end_date)
# print(percentiles)
# print()

# # test date invalid 3 (auto correct end date)
# start_date = "2021-05-01"
# end_date = "2022-07-01"
# print("From: " + start_date, " To: " + end_date)
# jsonFile, percentiles = processAllStocksChange(start_date, end_date)
# print(percentiles)
# print()

# # test date invalid 3 (auto correct end date)
# start_date = "2021-05-01"
# end_date = "2021-06-01"
# print("From: " + start_date, " To: " + end_date)
# jsonFile, percentiles = processAllStocksChange(start_date, end_date)
# print(percentiles)
# print()

# # test date invalid 5 (auto correct end date)
# start_date = "2022-06-15"
# end_date = "2022-08-10"
# print("From: " + start_date, " To: " + end_date)
# jsonFile, percentiles = processAllStocksChange(start_date, end_date)
# print(percentiles)
# print()

# # test date invalid 6 (auto correct end date)
# start_date = "2022-07-01"
# end_date = "2022-10-01"
# print("From: " + start_date, " To: " + end_date)
# jsonFile, percentiles = processAllStocksChange(start_date, end_date)
# print(percentiles)
# print()

# test date invalid 7 (auto correct end date)
# start_date = "2017-01-01"
# end_date = "2023-02-20"
# print("From: " + start_date, " To: " + end_date)
# jsonFile, percentiles = processAllStocksChange(start_date, end_date)
# print(percentiles)
# p = np.linspace(0, 100, 6001)
# ax = plt.gca()
# lines = [
#     ('linear', '-', 'C0'),
#     ('inverted_cdf', ':', 'C1'),
#     # Almost the same as `inverted_cdf`:
#     ('averaged_inverted_cdf', '-.', 'C1'),
#     ('closest_observation', ':', 'C2'),
#     ('interpolated_inverted_cdf', '--', 'C1'),
#     ('hazen', '--', 'C3'),
#     ('weibull', '-.', 'C4'),
#     ('median_unbiased', '--', 'C5'),
#     ('normal_unbiased', '-.', 'C6'),
# ]
# for method, style, color in lines:
#     ax.plot(
#         p, np.percentile(percentiles, p, method=method),
#         label=method, linestyle=style, color=color)
# ax.set(
#     title='Percentiles for different methods and data: ' + str(percentiles),
#     xlabel='Percentile',
#     ylabel='Estimated percentile value',
#     yticks=percentiles)
# ax.legend()
# plt.show()
# print()
