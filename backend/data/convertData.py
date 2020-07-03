import pandas as pd
import json

excel1 = r'/data/wangke/Event/食品及污染物知识库/化学污染物/化学污染物分类标准-最终_程序用.xlsx'
excel2 = r'/data/wangke/Event/食品及污染物知识库/限值标准/农药限值/2763.xlsx'
excel3 = r'/data/wangke/Event/食品及污染物知识库/限值标准/污染物限值/2762.xlsx'
excel4 = r'/data/wangke/Event/食品及污染物知识库/限值标准/真菌毒素限值/2761.xlsx'
excel5 = r'/data/wangke/Event/食品及污染物知识库/限值标准/食品添加剂限值/2760.xlsx'
json1 = r'/data/wangke/Event/食品及污染物知识库/微生物污染/微生物.json'
output_pollutant = r'/data/wangke/eventMarker/backend/data/pollutant.json'

excel_food = r'/data/wangke/Event/食品及污染物知识库/标准食品/standard_foods.xls'
output_food = r'/data/wangke/eventMarker/backend/data/food.json'


def read_food():
    df = pd.read_excel(excel_food, dtype=str)
    df = df.replace(pd.np.nan, '')
    df = df.replace('nan', '')
    res = []
    for i in range(len(df)):
        row = df.iloc[i].tolist()
        name = row[1]
        synonym = list(filter(lambda x: x != '', row[7:]))
        res.append({'name': name, 'synonym': synonym})
    with open(output_food, 'w', encoding='utf8') as f:
        json.dump(res, f, ensure_ascii=False)


read_food()


def dfs(node, call_before=None, call_back=None):
    if type(node) == list:
        for child in node:
            dfs(child, call_before, call_back)
        return
    if call_before is not None:
        call_before(node)
    if 'children' in node:
        for child in node['children']:
            dfs(child, call_before, call_back)
    if call_back is not None:
        call_back(node)


def read_field(json_file, field='name', unique=True):
    with open(json_file, 'r', encoding='utf8') as f:
        data = json.load(f)
    res = []
    dfs(data, call_before=lambda x: res.append(x[field]))
    res = list(filter(lambda x: x != '', res))
    if unique:
        res = list(set(res))
    return res


def read_column(excel, sheet=0, column='name', unique=True):
    df = pd.read_excel(excel, sheet_name=sheet, dtype=str)
    df = df.replace(pd.np.nan, '')
    df = df.replace('nan', '')
    vals = df[column].tolist()
    vals = list(filter(lambda x: x != '', vals))
    if unique:
        vals = list(set(vals))
    return vals


def add_synonym(arr):
    return [{'name': x, 'synonym': []} for x in arr]


elements = read_column(excel1, '元素类')
pesticides = list(set(read_column(excel1, '农药残留') + read_column(excel2, column='中文名称')))
veterinary_drug = read_column(excel1, '兽药及违禁物质')
additive = list(set(read_column(excel1, '食品添加剂') + read_column(excel5, column='中文名称')))
plasticizer = read_column(excel1, '塑化剂')
microbe = list(set(read_column(excel1, '生物毒素') + read_column(excel4, column='中文名称') + read_field(json1)))
inorganic = list(set(read_column(excel1, '其他无机物') + read_column(excel3, column='中文名称')))

pollutant = {
    '控制元素': add_synonym(elements),
    '农药': add_synonym(pesticides),
    '兽药及违禁物质': add_synonym(veterinary_drug),
    '食品添加剂': add_synonym(additive),
    '塑化剂': add_synonym(plasticizer),
    '微生物污染': add_synonym(microbe),
    '其他无机物': add_synonym(inorganic),
}
with open(output_pollutant, 'w', encoding='utf8') as f:
    json.dump(pollutant, f, ensure_ascii=False)
