import React, {Component} from 'react';
import {Typography, Empty, Row, Col, Button, Popconfirm, Tag, Input, Icon, Select, Spin, message} from 'antd';
import {splitSentence} from "./toolFunction";
import debounce from 'lodash/debounce';
import {getNextEventData, getPopulationCategory, postEvent, searchFood, searchPollutant} from "./getData";

const {Title, Paragraph, Text} = Typography;
const {Option, OptGroup} = Select;
const {TextArea} = Input;

class NewsView extends Component {
    render() {
        const data = this.props.data;
        if (!data || data === {})
            return <Empty/>;
        return (
            <Typography>
                <Title>原始新闻</Title>
                <Title level={2} className='center'>{data.title}</Title>
                <Text type='secondary' className='center'>{data.sourceText}</Text>
                <Paragraph>{data.content}</Paragraph>
                <a href={data.sourceLink} target='_blank'>原文链接</a>
            </Typography>
        )
    }
}

NewsView.defaultProps = {
    data: {
        "id": "524985-201907031726",
        "title": "金华市区人气龙虾店卫生安全吗？",
        "date": "2019-07-03 17:26",
        "abstract": "核心提示：随着夏季天气不断变热，“龙虾啤酒”成为不少市民的就餐选择。前期，金华市市场监管局面向社会征集大家希望检查的龙虾店，并确定抽查名单。近段时间以来，该局执法人员“兵分多路”陆续开展突击检查，结果如何？",
        "content": "　　随着夏季天气不断变热，“龙虾啤酒”成为不少市民的就餐选择。前期，市市场监管局面向社会征集大家希望检查的龙虾店，并确定抽查名单。近段时间以来，该局执法人员“兵分多路”陆续开展突击检查，结果如何？\n \n　　在市区金磐路756号的“人人爱”龙虾馆，记者发现后厨整体宽敞明亮，卫生状况较为整洁，当天供应的小龙虾经油锅烹炸后分筐摆放，整齐有序。但是，执法人员发现冷冻柜中的原食材被随意叠放着，而且没有密封存放。“冷冻柜里的半成品一定要密封保存，不然容易变质或被污染。”执法人员督促店家及时整改。\n \n　　不远处的阿福龙虾馆刚从市区江北搬到金磐路上，新店用餐区域整体明亮、干净整洁，蔬菜离墙离地存放且摆放有序，清水中的活虾看上去很新鲜。来到后厨，执法人员发现情况不及“门面”来得好，不仅设施陈旧，而且墙壁和天花板上还有霉点，需要及时清理。同在金磐路上的“许大姐”龙虾馆和“周氏一鸣”龙虾馆也存在细节问题。“许大姐”龙虾馆的后厨拥挤，还有不知用途的敞开式塑料桶，传菜电梯的消毒清洁不够到位。“周氏一鸣”龙虾馆的餐厨垃圾桶敞开着，夏天极易引来蚊虫。在后厨面积本就很小的情况下布局还较混乱，物品随意摆放。\n \n　　V6食材工作站位于鼓楼里创意园75号。该店后厨卫生清洁保持得不错，调味料以及配料等集中并分类摆放，环境较好。不过，调味料中有个别瓶子是重复使用，导致执法人员无法确认生产日期，还有部分食材未密封保存，有待改进。\n \n　　帝壹城商场内最近新开了一家名叫“帕帕泰”的龙虾馆。执法人员现场检查后，发现用餐区整体环境清爽，消毒设备按规定正常使用，但在后厨仍旧发现一些问题。比如垃圾桶敞口放置，地面非常湿滑容易滋生细菌，多处位置有霉点锈迹，洗碗区域和碗柜过近，并且碗柜没有柜门，餐具容易受潮。\n \n　　执法人员说，从今年检测情况看，市区龙虾店的就餐环境和后厨卫生相比往年有了较大进步，特别是在营业执照、健康证方面比较齐全，食品原料来源正规，存在问题主要是一些细节方面，后厨仍需进一步提升，接下去将督促各店家及时整改到位。\n \n　　“检查店面整体环境的同时，我们还随机抽取了一批食材作为样本，送到市食品药品检验检测研究院。”执法人员说，他们抽取了生熟龙虾、龙虾调味料、龙虾煎炸用油等，让检测人员给小龙虾进行一次“全面体检”，检测项目包括铅、砷、汞、镉等重金属含量，以及抗生素、药物残留等指标，届时将向社会公布检测结果。",
        "label": "地区：#浙江#金华市;行业：#渔业水产#食品检测#酒业;标签：#卫生#检查#啤酒#龙虾#监管",
        "sourceText": "时间：2019-07-03 17:26 来源：金华日报 作者： 盛游",
        "sourceName": "金华日报",
        "sourceLink": "http://epaper.jhnews.com.cn/jhrb/jhrbpaper/pc/con/201907/01/content_127187.html"
    }
};

class PollutionRemoteSelect extends Component {

    constructor(props) {
        super(props);
        this.fetchPollution = debounce(this.fetchPollution, 800);
    }

    state = {
        data: {},
        fetching: false,
    };
    fetchPollution = value => {
        // this.lastFetchId += 1;
        // const fetchId = this.lastFetchId;
        this.setState({data: [], fetching: true});
        searchPollutant(value, (data) => {
            this.setState({data, fetching: false});
        });
    };

    handleChange = value => {
        this.setState({
            data: {},
            fetching: false,
        }, () => this.props.setValue(value));
    };

    render() {
        const {fetching, data} = this.state;
        const {value} = this.props;
        return (
            <Select
                mode="multiple"
                // labelInValue
                value={value}
                placeholder="选择食物"
                defaultValue={this.props.defaultValue}
                notFoundContent={fetching ? <Spin size="small"/> : null}
                filterOption={false}
                onSearch={this.fetchPollution}
                onChange={this.handleChange}
                style={{width: '100%'}}
            >
                {Object.entries(data).map(([key, val]) => <OptGroup label={key} key={key}>
                    {val.map(d => <Option key={d} value={d}>{d}</Option>)}
                </OptGroup>)}
            </Select>
        );
    }
}

class FoodRemoteSelect extends Component {
    constructor(props) {
        super(props);
        this.fetchFood = debounce(this.fetchFood, 800);
    }

    state = {
        data: [],
        fetching: false,
    };
    fetchFood = value => {
        // this.lastFetchId += 1;
        // const fetchId = this.lastFetchId;
        this.setState({data: [], fetching: true});
        searchFood(value, (data) => {
            this.setState({data, fetching: false});
        });
    };

    handleChange = value => {
        this.setState({
            data: [],
            fetching: false,
        }, () => this.props.setValue(value));
    };

    render() {
        const {fetching, data} = this.state;
        const {value} = this.props;
        return (
            <Select
                mode="multiple"
                // labelInValue
                value={value}
                placeholder="选择食物"
                defaultValue={this.props.defaultValue}
                notFoundContent={fetching ? <Spin size="small"/> : null}
                filterOption={false}
                onSearch={this.fetchFood}
                onChange={this.handleChange}
                style={{width: '100%'}}
            >
                {data.map(d => (
                    <Option key={d}>{d}</Option>
                ))}
            </Select>
        );
    }
}

class PopulationRemoteSelect extends Component {
    state = {
        data: {}
    };

    componentWillMount() {
        getPopulationCategory(data => this.setState({data}));
    }

    render() {
        return <Select
            mode="tags"
            value={this.props.value}
            placeholder="请选择受众人群"
            defaultValue={this.props.defaultValue}
            filterOption={false}
            onChange={value => this.props.setValue(value)}
            style={{width: '100%'}}
        >
            {Object.entries(this.state.data).map(([key, val]) => <OptGroup label={key} key={key}>
                {val.map(d => <Option key={d} value={d}>{d}</Option>)}
            </OptGroup>)}
        </Select>
    }
}

class Note extends Component {
    onChange = ({target: {value}}) => this.props.setValue(value);

    render() {
        return (
            <TextArea
                placeholder="特殊情况备注，如无法在知识库中找到涉及的食品、污染物等"
                value={this.props.value}
                onChange={this.onChange}
                autoSize/>
        )
    }
}

class Location extends Component {
    state = {
        inputVisible: false,
        inputValue: '',
    };
    saveInputRef = input => (this.input = input);
    handleRemove = removed => {
        const newValue = this.props.value.filter(tag => tag !== removed);
        this.props.setValue(newValue);
    };
    showInput = () => {
        this.setState({inputVisible: true}, () => this.input.focus());
    };
    handleInputChange = e => {
        this.setState({inputValue: e.target.value});
    };

    handleInputConfirm = () => {
        const {inputValue} = this.state;
        let {value} = this.props;
        if (inputValue && value.indexOf(inputValue) === -1) {
            value = [...value, inputValue];
        }
        this.setState({
            inputVisible: false,
            inputValue: '',
        });
        this.props.setValue(value);
    };

    render() {
        const {inputVisible, inputValue} = this.state;
        const {value} = this.props;
        return (
            <div>
                {value.map((tag) =>
                    <Tag key={tag} closable={true} onClose={() => this.handleRemove(tag)}>
                        {tag}
                    </Tag>)}
                {inputVisible && (
                    <Input
                        ref={this.saveInputRef}
                        type="text"
                        size="small"
                        style={{width: 78}}
                        value={inputValue}
                        onChange={this.handleInputChange}
                        onBlur={this.handleInputConfirm}
                        onPressEnter={this.handleInputConfirm}
                    />
                )}
                {!inputVisible && (
                    <Tag onClick={this.showInput} style={{background: '#fff', borderStyle: 'dashed'}}>
                        <Icon type="plus"/> 新增
                    </Tag>
                )}
            </div>
        );
    };
}

class MarkerView extends Component {
    state = {
        text: this.props.data.event_text,
        news_id: this.props.data.news_id,
        isEvent: true,
        locations: this.props.data.location.extracted_location,
        food: this.props.data.food_name,
        pollutants: Array.prototype.concat(...Object.values(this.props.data.pollutants)).filter((d, i, a) => a.indexOf(d) === i),
        harm: this.props.data.harm.filter((d, i, a) => a.indexOf(d) === i),
        population: this.props.data.related_people,
        note: undefined
    };
    // 事件相关文本
    eventText = (text) => <Typography>
        <Title level={4}>事件相关语句</Title>
        <Paragraph>{text}</Paragraph>
        <Popconfirm title="确认该语句不包含食品安全事件？" onConfirm={() => {
            this.setState({isEvent: false}, this.onSubmit);
        }}><Button type='danger'>该语句不包含事件</Button></Popconfirm>
    </Typography>;
    // 地点
    setLocation = (locations) => this.setState({locations});
    locationTags = () => <Typography>
        <Title level={4}>事件发生地</Title>
        <Location value={this.state.locations} setValue={this.setLocation.bind(this)}/>
    </Typography>;
    // 食品
    setFood = (food) => this.setState({food});
    foodType = () => <Typography>
        <Title level={4}>事件涉及食品</Title>
        <FoodRemoteSelect defaultValue={this.state.food} value={this.state.food} setValue={this.setFood.bind(this)}/>
    </Typography>;
    // 污染物
    setPollution = (pollutants) => this.setState({pollutants});
    pollutionType = () => <Typography>
        <Title level={4}>污染物</Title>
        <PollutionRemoteSelect defaultValue={this.state.pollutants} value={this.state.pollutants}
                               setValue={this.setPollution.bind(this)}/>
    </Typography>;
    // 危害因素
    handleHarmChange = (harm) => this.setState({harm});
    harmFactor = () => {
        const children = splitSentence(this.props.data.event_text).map((d, i) => <Option key={d}>{d}</Option>);
        const {harm} = this.state;
        return <Typography>
            <Title level={4}>危害因素</Title>
            <Select mode="tags" style={{width: '100%'}} placeholder="请选择危害因素" defaultValue={harm}
                    onChange={this.handleHarmChange}>{children}</Select>
        </Typography>
    };
    // 受众人群
    setPopulation = (population) => this.setState({population});
    relatedPopulation = () => {
        const {population} = this.state;
        return <Typography>
            <Title level={4}>主要受影响人群</Title>
            <PopulationRemoteSelect defaultValue={population} value={population}
                                    setValue={this.setPopulation.bind(this)}/>
        </Typography>

    };
    // 备注
    setNote = (note) => this.setState({note});
    noteArea = () => <Typography>
        <Title level={4}>特殊情况备注</Title>
        <Note value={this.state.note} setValue={this.setNote.bind(this)}/>
    </Typography>;
    onSubmit = () => {
        postEvent(this.state, res => {
            if (res === "success") {
                message.success("已成功保存");
                this.props.getNext();
            } else {
                console.log(res);
                message.error(res);
            }
        })
    };
    submitButton = () => <Popconfirm title="确认提交？" onConfirm={this.onSubmit}><Button
        type='primary'>提交标注</Button></Popconfirm>;

    render() {
        const data = this.props.data;
        return (
            <div>
                {this.eventText(data.event_text)}
                {this.locationTags()}
                {this.harmFactor()}
                {this.foodType()}
                {this.pollutionType()}
                {this.relatedPopulation()}
                {this.noteArea()}
                {this.submitButton()}
            </div>
        )
    }
}

export class Main extends Component {
    state = {
        content: '',
        data: {}
    };
    getNext = () => {
        getNextEventData((content, data) => this.setState({content, data}));
    };

    componentWillMount() {
        this.getNext();
    }

    render() {
        const {content, data} = this.state;
        if (!content)
            return <Spin/>;
        return (
            <div>
                <Row type="flex" justify="space-around">
                    <Col span={8}><NewsView data={content}/></Col>
                    <Col span={12}>
                        <MarkerView data={data} key={data.news_id + data.event_text} getNext={this.getNext.bind(this)}/>
                    </Col>
                </Row>
            </div>
        )
    }
}