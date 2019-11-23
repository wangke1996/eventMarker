import React, {Component} from 'react';
import {Typography, Empty, Row, Col, Button, Popconfirm, Tag, Input, Icon, Select, Spin, message, Divider} from 'antd';
import {splitParagraph, splitSentence} from "../lib/toolFunction";
import debounce from 'lodash/debounce';
import {getNextEventData, getPopulationCategory, postEvent, searchFood, searchPollutant} from "../lib/getData";

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
                <Title level={2} type="secondary">原始新闻</Title>
                {/*<Divider>*/}
                <Title level={3} className='center'>{data.title}</Title>
                {/*</Divider>*/}
                <Text type='secondary' className='center'>{data.sourceText}</Text>
                {splitParagraph(data.content).map((d, i) => <Paragraph key={i}>{d}</Paragraph>)}
                <a href={data.sourceLink} target='_blank'>原文链接</a>
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
    setLocation = (locations) => this.setState({locations});
    setFood = (food) => this.setState({food});
    setPollution = (pollutants) => this.setState({pollutants});
    handleHarmChange = (harm) => this.setState({harm});
    harmFactor = () => {
        const children = splitSentence(this.props.data.event_text).map((d, i) => <Option key={d}>{d}</Option>);
        const {harm} = this.state;
        return <Select mode="tags" style={{width: '100%'}} placeholder="请选择危害因素" defaultValue={harm}
                       onChange={this.handleHarmChange}>{children}</Select>
    };
    setPopulation = (population) => this.setState({population});
    setNote = (note) => this.setState({note});
    onSubmit = () => {
        postEvent(this.state, res => {
            if (res === "success") {
                message.success("已成功保存");
                this.props.getNext();
            } else {
                message.error(res);
            }
        })
    };

    elementTitle = (title, orientation) => <Divider className='margin-top margin-bottom-small'
                                                    orientation={orientation}>
        <Title level={4}>{title}</Title></Divider>;

    render() {
        const data = this.props.data;
        return (
            <Typography>
                <Title level={2} type="secondary">事件元素</Title>

                {this.elementTitle("事件相关语句")}
                {splitParagraph(data.event_text).map((d, i) => <Paragraph key={i}>{d}</Paragraph>)}
                <Popconfirm title="确认该语句不包含食品安全事件？" className='center' onConfirm={() => {
                    this.setState({isEvent: false}, this.onSubmit);
                }}><Button type='danger'>该语句不包含事件</Button></Popconfirm>

                {this.elementTitle("事件发生地", "left")}
                <Location value={this.state.locations} setValue={this.setLocation.bind(this)}/>

                {this.elementTitle("危害因素", "right")}
                {this.harmFactor()}

                {this.elementTitle("涉及食品", "left")}
                <FoodRemoteSelect defaultValue={this.state.food} value={this.state.food}
                                  setValue={this.setFood.bind(this)}/>

                {this.elementTitle("污染物", "right")}
                <PollutionRemoteSelect defaultValue={this.state.pollutants} value={this.state.pollutants}
                                       setValue={this.setPollution.bind(this)}/>

                {this.elementTitle("主要受影响人群", "left")}
                <PopulationRemoteSelect defaultValue={this.state.population} value={this.state.population}
                                        setValue={this.setPopulation.bind(this)}/>

                {this.elementTitle("特殊情况备注", "right")}
                <Note value={this.state.note} setValue={this.setNote.bind(this)}/>

                <Popconfirm title="确认提交？" className='margin-top center' onConfirm={this.onSubmit}>
                    <Button type='primary'>提交标注</Button>
                </Popconfirm>
            </Typography>
        )
    }
}

export class MarkView extends Component {
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