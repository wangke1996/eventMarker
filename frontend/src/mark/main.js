import React, {Component} from 'react';
import {
    Typography,
    Empty,
    Row,
    Col,
    Button,
    Popconfirm,
    Tag,
    Input,
    Icon,
    Select,
    Spin,
    message,
    Divider
} from 'antd';
import {splitParagraph, splitSentence} from "../lib/toolFunction";
import debounce from 'lodash/debounce';
import {
    getNextEventData,
    getNextNews,
    getPopulationCategory,
    postEvent, postEvents,
    searchFood,
    searchPollutant
} from "../lib/getData";

const {Title, Paragraph, Text} = Typography;
const {Option, OptGroup} = Select;
const {TextArea} = Input;

class NewsView extends Component {
    paragraphs = () => {
        const {content, events} = this.props.data;
        const allText = content.content;
        let resTexts = [allText];
        let eventIndex = [-1];
        for (let i = 0; i < events.length; i++) {
            const eventText = events[i].event_text;
            for (let j = 0; j < resTexts.length; j++) {
                const startIndex = resTexts[j].indexOf(eventText);
                if (startIndex < 0)
                    continue;
                const beforeText = resTexts[j].slice(0, startIndex);
                const afterText = resTexts[j].slice(startIndex + eventText.length);
                resTexts = Array.prototype.concat(resTexts.slice(0, j), [beforeText, eventText, afterText], resTexts.slice(j + 1));
                eventIndex = Array.prototype.concat(eventIndex.slice(0, j), [-1, i, -1], eventIndex.slice(j + 1));
                break;
            }
        }
        let paragraphs = [];
        for (let i = 0; i < resTexts.length; i++) {
            if (!resTexts[i])
                continue;
            let newParagraphs = splitParagraph(resTexts[i]);
            if (eventIndex[i] >= 0) {
                newParagraphs = newParagraphs.map((d, j) => <Paragraph mark key={i + '_' + j}
                                                                       style={{cursor: "pointer"}} onClick={() => {
                    this.props.setEventIndex(eventIndex[i]);
                }}>{d}</Paragraph>);
            } else
                newParagraphs = newParagraphs.map((d, j) => <Paragraph key={i + '_' + j}>{d}</Paragraph>);
            paragraphs.push(...newParagraphs);
        }
        return paragraphs;
        // const eventStartIndex = eventTexts.map(d => allText.indexOf(d));
    };

    render() {
        const {content} = this.props.data;
        if (!content || !content.title)
            return <Empty/>;
        return (
            <Typography>
                <Title level={2} type="secondary">原始新闻</Title>
                {/*<Divider>*/}
                <Title level={3} className='center'>{content.title}</Title>
                {/*</Divider>*/}
                <Text type='secondary' className='center'>{content.sourceText}</Text>
                {/*{splitParagraph(data.content).map((d, i) => <Paragraph key={i}>{d}</Paragraph>)}*/}
                <div style={{height: '800px', overflow:'scroll'}}>
                    {this.paragraphs()};
                </div>
                <a href={content.sourceLink} target='_blank'>原文链接</a>
            </Typography>
        )
    }
}

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
                placeholder="选择污染物"
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
                autoSize={{minRows: 1, maxRows: 3}}/>
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
                    <Tag className='large' key={tag} closable={true} onClose={() => this.handleRemove(tag)}>
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
                    <Tag className='large' onClick={this.showInput} style={{background: '#fff', borderStyle: 'dashed'}}>
                        <Icon type="plus"/> 新增
                    </Tag>
                )}
            </div>
        );
    };
}

class MarkerView extends Component {
    state = {
        text: this.props.marked.text || this.props.data.event_text,
        isEvent: true,
        locations: this.props.marked.locations || this.props.data.location.extracted_location,
        food: this.props.marked.food || this.props.data.food_name,
        pollutants: this.props.marked.pollutants || Array.prototype.concat(...Object.values(this.props.data.pollutants)).filter((d, i, a) => a.indexOf(d) === i),
        // harm: this.props.marked.harm || this.props.data.harm.filter((d, i, a) => a.indexOf(d) === i),
        population: this.props.marked.population || this.props.data.related_people,
        note: this.props.marked.note
    };
    setLocation = (locations) => this.setState({locations});
    setFood = (food) => this.setState({food});
    setPollution = (pollutants) => this.setState({pollutants});
    // handleHarmChange = (harm) => this.setState({harm});
    // harmFactor = () => {
    //     const children = splitSentence(this.props.data.event_text).map((d, i) => <Option key={d}>{d}</Option>);
    //     const {harm} = this.state;
    //     return <Select mode="tags" style={{width: '100%'}} placeholder="请选择危害因素" defaultValue={harm} maxTagCount={5}
    //                    onChange={this.handleHarmChange}>{children}</Select>
    // };
    setPopulation = (population) => this.setState({population});
    setNote = (note) => this.setState({note});
    onSubmit = () => {
        // postEvent(this.state, res => {
        //     if (res === "success") {
        //         message.success("已成功保存");
        //         this.props.getNext();
        //     } else {
        //         message.error(res);
        //     }
        // })
        this.props.setResult(this.state);
        message.success("已暂存，整体提交前离开会丢失已做的修改");
    };

    elementTitle = (title, orientation) => <Divider className='margin-top margin-bottom-small'
                                                    orientation={orientation}>
        <Title level={4}>{title}</Title></Divider>;

    render() {
        const data = this.props.data;
        return (
            <Typography>
                <Title level={2} type="secondary">事件元素</Title>
                <Paragraph>左侧为一条新闻，<Text mark>带标记的文本</Text>是可能包含事件的段落（可能有多个段落被标记），你需要：</Paragraph>
                <Paragraph>
                    <ul>
                        <li><Text strong>选择确实包含食品安全事件的段落</Text>（所有段落均不包含事件？
                            <Popconfirm title="确认所有标记段落均不包含食品安全事件？" onConfirm={this.props.onSubmit}><Button
                                type='danger'>点此</Button></Popconfirm>）
                        </li>
                        <li><Text strong>校对下面的各个事件元素（食品和污染物输入关键字可搜索）</Text></li>
                        <li><Text strong>点击“保存此句”按钮</Text>（不保存则视为该段落不包含事件）</li>
                        <li><Text strong>校对完所有包含事件的段落并保存后，点击“提交全部”按钮</Text></li>
                    </ul>
                </Paragraph>
                {this.elementTitle("事件相关语句")}
                {splitParagraph(data.event_text).map((d, i) => <Paragraph key={i}>{d}</Paragraph>)}
                {/*<Row type='flex' justify="space-between">*/}
                <Col span={10}>
                    {this.elementTitle("事件发生地", "left")}
                    <Location value={this.state.locations} setValue={this.setLocation.bind(this)}/>
                </Col>
                {/*<Col span={10}>*/}
                {/*    {this.elementTitle("危害因素", "right")}*/}
                {/*    {this.harmFactor()}*/}
                {/*</Col>*/}
                {/*</Row>*/}
                {/*<Row type='flex' justify="space-between">*/}
                {/*    <Col span={10}>*/}
                {this.elementTitle("涉及食品", "right")}
                <FoodRemoteSelect defaultValue={this.state.food} value={this.state.food}
                                  setValue={this.setFood.bind(this)}/>
                {/*</Col>*/}
                {/*<Col span={10}>*/}
                {this.elementTitle("污染物", "left")}
                <PollutionRemoteSelect defaultValue={this.state.pollutants} value={this.state.pollutants}
                                       setValue={this.setPollution.bind(this)}/>
                {/*</Col>*/}
                {/*</Row>*/}

                {/*<Row type='flex' justify="space-between">*/}
                {/*    <Col span={10}>*/}
                {this.elementTitle("主要受影响人群", "right")}
                <PopulationRemoteSelect defaultValue={this.state.population} value={this.state.population}
                                        setValue={this.setPopulation.bind(this)}/>
                {/*</Col>*/}
                {/*<Col span={10}>*/}
                {this.elementTitle("特殊情况备注", "left")}
                <Note value={this.state.note} setValue={this.setNote.bind(this)}/>
                {/*</Col>*/}
                {/*</Row>*/}
                <Row type='flex' justify="space-between">
                    <Col span={10}>
                        <Button type='primary' className='margin-top center' onClick={this.onSubmit}>保存此句</Button>
                    </Col>
                    <Col span={10}>
                        <Popconfirm className='margin-top center' title="请确认：已校对并保存所有包含事件的语句！"
                                    onConfirm={this.props.onSubmit}><Button
                            type='danger'>提交全部</Button></Popconfirm>
                    </Col>
                </Row>


            </Typography>
        )
    }
}

export class MarkView extends Component {
    state = {
        eventIndex: -1,
        data: {},
        markedResult: [],
    };
    getNext = () => {
        // getNextEventData((data, eventIndex) => this.setState({data, eventIndex}));
        getNextNews(data => {
            const markedResult = data.events.map(d => {
                return {text: d.event_text, news_id: d.news_id, isEvent: false,}
            });
            this.setState({data, markedResult, eventIndex: 0});
        })
    };
    setResult = (data) => {
        let {markedResult, eventIndex} = this.state;
        Object.assign(markedResult[eventIndex], data);
        this.setState({markedResult});
    };

    componentWillMount() {
        this.getNext();
    }

    setEventIndex = (eventIndex) => this.setState({eventIndex});
    onSubmit = () => {
        postEvents(this.state.markedResult, res => {
            if (res === "success") {
                message.success("已成功保存");
                this.getNext();
            } else {
                message.error(res);
            }
        })
    };

    render() {
        const {eventIndex, data, markedResult} = this.state;
        if (!data.events || eventIndex < 0)
            return <Spin/>;
        const event = data.events[eventIndex];
        return (
            <div>
                <Row type="flex" justify="space-around">
                    <Col span={8}><NewsView data={data} setEventIndex={this.setEventIndex.bind(this)}/></Col>
                    <Col span={12}>
                        <MarkerView data={event} marked={markedResult[eventIndex]}
                                    key={event.news_id + event.event_text}
                                    setResult={this.setResult.bind(this)}
                                    onSubmit={this.onSubmit.bind(this)}/>
                    </Col>
                </Row>
            </div>
        )
    }
}