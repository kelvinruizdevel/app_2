/* eslint-disable camelcase */
/* eslint-disable no-unused-vars */
/* eslint-disable no-continue */
import { useEffect, useState } from 'react';
import useTranslation from 'next-translate/useTranslation';
import {
  Box,
  Divider,
  Avatar,
  Flex,
  useColorModeValue,
  useToast,
  Button,
  ButtonGroup,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverArrow,
  PopoverCloseButton,
  PopoverBody,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
} from '@chakra-ui/react';
import { useRouter } from 'next/router';
import asPrivate from '../../../common/context/PrivateRouteWrapper';
import ReactSelect from '../../../common/components/ReactSelect';
import Link from '../../../common/components/NextChakraLink';
import Heading from '../../../common/components/Heading';
import { usePersistent } from '../../../common/hooks/usePersistent';
import bc from '../../../common/services/breathecode';
import Icon from '../../../common/components/Icon';
import Text from '../../../common/components/Text';
import TaskLabel from '../../../common/components/taskLabel';
import DottedTimeline from '../../../common/components/DottedTimeline';
import useStyle from '../../../common/hooks/useStyle';
import useFormatTimeString from '../../../common/hooks/useFormatTimeString';
import { isGithubUrl } from '../../../utils/regex';
import ButtonHandler, { ReviewModal, NoInfoModal, DeliverModal, DetailsModal } from '../../../js_modules/assignmentHandler/index';
import useAssignments from '../../../common/store/actions/assignmentsAction';
import { isWindow } from '../../../utils';
// import Image from '../../../common/components/Image';
import PopoverHandler from '../../../js_modules/assignmentHandler/PopoverHandler';
import handlers from '../../../common/handlers';
import LoaderScreen from '../../../common/components/LoaderScreen';
import { ORIGIN_HOST } from '../../../utils/variables';

function Assignments() {
  const { t } = useTranslation('assignments');
  const educationalStatusList = [
    {
      label: t('educational-list.active'),
      value: 'active',
    },
    {
      label: t('educational-list.postponed'),
      value: 'postponed',
    },
    {
      label: t('educational-list.graduated'),
      value: 'graduated',
    },
    {
      label: t('educational-list.suspended'),
      value: 'suspended',
    },
    {
      label: t('educational-list.dropped'),
      value: 'dropped',
    },
  ];
  const statusList = [
    {
      label: t('status.delivered'),
      value: 'delivered',
    },
    {
      label: t('status.approved'),
      value: 'approved',
    },
    {
      label: t('status.rejected'),
      value: 'rejected',
    },
    {
      label: t('status.undelivered'),
      value: 'undelivered',
    },
    {
      label: t('status.ignored'),
      value: 'ignored',
    },
  ];
  const typeList = [
    {
      label: t('type.project'),
      value: 'PROJECT',
    },
    {
      label: t('type.quiz'),
      value: 'QUIZ',
    },
    {
      label: t('type.lesson'),
      value: 'LESSON',
    },
    {
      label: t('type.exercise'),
      value: 'EXERCISE',
    },
  ];
  const router = useRouter();
  const { query } = router;
  const { cohortSlug, academy } = query;
  const toast = useToast();
  const { formatTimeString } = useFormatTimeString();
  const { hexColor } = useStyle();
  const { contextState, setContextState } = useAssignments();
  const [cohortSession] = usePersistent('cohortSession', {});
  const [syllabusData, setSyllabusData] = useState({
    assignments: [],
  });
  const [personalCohorts, setPersonalCohorts] = useState([]);
  // const [allTasksPaginationProps, setAllTasksPaginationProps] = useState({});
  const [allTasksOffset, setAllTasksOffset] = useState(20);
  const [isFetching, setIsFetching] = useState(false);
  const [typeLabel, setTypeLabel] = useState(typeList.find((option) => option.value === query.task_type) || {
    label: t('type.project'),
    value: 'PROJECT',
  });
  const [studentLabel, setStudentLabel] = useState(null);
  const [studentOptions, setStudentOptions] = useState([]);
  const [projectLabel, setProjectLabel] = useState(null);
  const [educationalLabel, setEducationalLabel] = useState(query.educational_status ? educationalStatusList.filter((option) => query.educational_status.toLowerCase().includes(option.value)) : [{
    label: t('educational-list.active'),
    value: 'active',
  }]);
  const [statusLabel, setStatusLabel] = useState(statusList.find((option) => option.value === query.status));
  const [openFilter, setOpenFilter] = useState(false);
  const [currentView, setCurrentView] = useState(Number(query.view) || 0);
  const [currentTask, setCurrentTask] = useState(null);
  const [deliveryUrl, setDeliveryUrl] = useState('');
  const [sort, setSort] = useState(query.sort || undefined);

  const [currentStudentList, setCurrentStudentList] = useState([]);

  const [selectedCohort, setSelectedCohort] = useState(null);
  const [loadStatus, setLoadStatus] = useState({
    loading: true,
    status: 'loading',
  });

  const linkColor = useColorModeValue('blue.default', 'blue.300');
  const borderColor = useColorModeValue('gray.200', 'gray.500');

  const lang = {
    es: '/es/',
    en: '/',
  };

  const statusColors = {
    APPROVED: hexColor.green,
    REJECTED: hexColor.danger,
    UNDELIVERED: hexColor.danger,
    DELIVERED: hexColor.yellowDefault,
  };

  const queryStudentExists = query.student !== undefined && query.student?.length > 0;
  const queryStatusExists = query.status !== undefined && query.status?.length > 0;
  const queryProjectExists = query.project !== undefined && query.project?.length > 0;

  const studentDefaultValue = currentStudentList
    ?.filter((l) => l.user.id === Number(router.query.student))
    .map((l) => l?.user?.id)[0];

  const reverseStatus = (status) => {
    if (status === 'delivered') return { task_status: 'DONE', revision_status: 'PENDING' };
    if (status === 'approved') return { revision_status: 'APPROVED' };
    if (status === 'rejected') return { revision_status: 'REJECTED' };
    if (status === 'undelivered') return { task_status: 'PENDING', revision_status: 'PENDING' };
    if (status === 'ignored') return { revision_status: 'ignored' };
    return {};
  };

  const getFilterAssignments = (cohortId, academyId, studentId) => {
    setLoadStatus({ loading: true, status: 'loading' });
    bc.todo({
      limit: 1000,
      task_type: typeLabel?.value || undefined,
      student: studentId || undefined,
      sort,
      educational_status: educationalLabel.length > 0 ? educationalLabel.map((val) => val.value).join(',').toUpperCase() : undefined,
      like: query.project,
      ...reverseStatus(query.status),
    })
      .getAssignments({ id: cohortId, academy: academyId })
      .then((projectList) => {
        setIsFetching(false);
        const allTasks = projectList.data?.results;

        setContextState({
          allTasks: [...allTasks],
        });
      })
      .catch((error) => {
        setIsFetching(false);
        toast({
          position: 'top',
          title: t('alert-message:error-fetching-tasks'),
          status: 'error',
          duration: 7000,
          isClosable: true,
        });
        console.error('There was an error fetching the tasks', error);
      })
      .finally(() => setLoadStatus({ loading: false, status: 'idle' }));
  };

  useEffect(() => {
    bc.admissions()
      .me()
      .then(({ data }) => {
        const cohortFiltered = data.cohorts.filter(
          (cohort) => cohort.role !== 'STUDENT',
        );
        const dataStruct = cohortFiltered.map((l) => ({
          label: l.cohort.name,
          slug: l.cohort.slug,
          value: l.cohort.id,
          academy: l.cohort.academy.id,
        }));

        setPersonalCohorts(
          dataStruct.sort((a, b) => a.label.localeCompare(b.label)),
        );
        setSelectedCohort(dataStruct.find((c) => c.slug === cohortSlug));
      })
      .catch(() => {
        toast({
          position: 'top',
          title: t('alert-message:error-fetching-personal-cohorts'),
          status: 'error',
          duration: 7000,
          isClosable: true,
        });
      });
  }, []);

  useEffect(() => {
    if (selectedCohort) {
      bc.admissions().cohort(selectedCohort.slug, academy)
        .then(async ({ data }) => {
          const syllabusInfo = await bc.admissions().syllabus(data.syllabus_version.slug, data.syllabus_version.version, academy);
          if (syllabusInfo?.data) {
            let assignments = syllabusInfo.data.json.days.filter((obj) => obj.assignments && Array.isArray(obj.assignments) && obj.assignments.length > 0 && typeof obj.assignments[0] === 'object').map((obj) => obj.assignments);
            assignments = [].concat(...assignments);
            const syllabusProjects = syllabusInfo.data.json.days.filter((day) => day.project && typeof day.project === 'object').map(({ project }) => ({ ...project }));
            if (query.project) {
              const filteredProject = syllabusProjects.find((project) => project.slug === query.project);
              setProjectLabel(filteredProject && { label: filteredProject.title, value: filteredProject.slug });
            }
            setSyllabusData({
              assignments,
            });
          }
        })
        .catch(() => {
          toast({
            position: 'top',
            title: t('alert-message:error-fetching-cohorts'),
            status: 'error',
            duration: 7000,
            isClosable: true,
          });
        });
      handlers
        .getStudents(selectedCohort.slug, academy)
        .then((students) => {
          setStudentOptions(students.map((student) => ({
            id: student.user.id,
            value:
              `${student.user.first_name}-${student.user.last_name}`?.toLowerCase(),
            label: `${student.user.first_name} ${student.user.last_name}`,
          })));
          if (query.student) {
            const filteredStudent = students.find((student) => student.user.id === Number(query.student));
            setStudentLabel(filteredStudent && {
              id: filteredStudent.user.id,
              value:
                `${filteredStudent.user.first_name}-${filteredStudent.user.last_name}`?.toLowerCase(),
              label: `${filteredStudent.user.first_name} ${filteredStudent.user.last_name}`,
            });
          }
        });
    }
  }, [selectedCohort]);

  const loadStudents = () => {
    if (selectedCohort) {
      setLoadStatus({ loading: true, status: 'loading' });
      const cohortId = selectedCohort.value;
      const academyId = selectedCohort.academy || academy;
      const slug = selectedCohort.slug || cohortSlug;
      bc.cohort({ sort, users: query.student, educational_status: educationalLabel.length > 0 ? educationalLabel.map((val) => val.value).join(',').toUpperCase() : undefined })
        .getStudentsWithTasks(slug, academyId)
        .then((res) => {
          const students = res?.data;
          setCurrentStudentList(students);
        })
        .catch(() => {
          toast({
            position: 'top',
            title: t('alert-message:error-fetching-students'),
            status: 'error',
            duration: 7000,
            isClosable: true,
          });
        });
      getFilterAssignments(cohortId, academyId, router.query.student);
    }
    if (!selectedCohort?.value && selectedCohort !== null) {
      setLoadStatus({ loading: false, status: 'idle' });
    }
  };

  useEffect(() => {
    loadStudents();
  }, [
    selectedCohort,
    studentDefaultValue,
    router.query,
  ]);

  const filteredTasks = contextState.allTasks.length > 0
    ? contextState.allTasks
      .filter((_, i) => i < allTasksOffset)
    : [];

  const handleScroll = () => {
    const scrollTop = isWindow && document.documentElement.scrollTop;
    const offsetHeight = isWindow && document.documentElement.offsetHeight + 15;
    const innerHeight = isWindow && window.innerHeight;
    if (innerHeight + scrollTop <= offsetHeight && !queryStudentExists) return;
    setIsFetching(true);
  };

  useEffect(() => {
    if (allTasksOffset < contextState.allTasks.length) {
      window.addEventListener('scroll', handleScroll);
      return () => window.removeEventListener('scroll', handleScroll);
    }

    return () => {};
  }, [allTasksOffset, contextState]);

  useEffect(() => {
    if (!isFetching) return;
    if (queryStudentExists || queryProjectExists || queryStatusExists) {
      setAllTasksOffset(contextState.allTasks.length);
      setIsFetching(false);
    }

    if (filteredTasks && allTasksOffset < contextState.allTasks.length) {
      if (!queryStudentExists) {
        setAllTasksOffset(allTasksOffset + 20);
        setIsFetching(false);
      }
    } else {
      setIsFetching(false);
    }
  }, [isFetching, queryStatusExists, queryProjectExists, queryStudentExists]);

  const closeFilterModal = () => setOpenFilter(false);

  const applyFilters = () => {
    const { project, student, status, task_type, educational_status, ...params } = router.query;
    const filter = {};
    if (projectLabel) filter.project = projectLabel.value;
    if (studentLabel) filter.student = studentLabel.id;
    if (statusLabel) filter.status = statusLabel.value;
    if (typeLabel) filter.task_type = typeLabel.value;
    if (educationalLabel.length > 0) filter.educational_status = educationalLabel.map((val) => val.value).join(',').toUpperCase();
    router.push({
      query: {
        ...params,
        ...filter,
      },
    });
    closeFilterModal();
  };

  const clearFilters = () => {
    const { project, student, status, task_type, educational_status, ...params } = router.query;
    setProjectLabel(null);
    setStudentLabel(null);
    setStatusLabel(null);
    setTypeLabel(null);
    setEducationalLabel([]);
    router.push({
      query: {
        ...params,
      },
    });
  };

  const updpateAssignment = (taskUpdated) => {
    const keyIndex = contextState.allTasks.findIndex((x) => x.id === taskUpdated.id);
    setContextState({
      allTasks: [
        ...contextState.allTasks.slice(0, keyIndex), // before keyIndex (inclusive)
        taskUpdated, // key item (updated)
        ...contextState.allTasks.slice(keyIndex + 1), // after keyIndex (exclusive)
      ],
    });
    loadStudents();
  };

  const getStatus = (task) => {
    if (!task) return null;
    if (task.task_status === 'DONE' && task.revision_status === 'PENDING') return 'DELIVERED';
    if (task.task_status === 'PENDING' && task.revision_status === 'PENDING') return 'UNDELIVERED';
    return task.revision_status;
  };

  const showSingleTask = async (task) => {
    try {
      const status = getStatus(task);
      let file;
      const academyId = selectedCohort?.academy || academy || personalCohorts.find((l) => l.slug === cohortSlug)?.academy;
      if (status === 'UNDELIVERED' || status === 'REJECTED') {
        const { data } = await bc.todo().deliver({
          id: task.id,
          academy: academyId,
        });
        setDeliveryUrl(data.delivery_url);
      } else if (status === 'APPROVED' || status === 'DELIVERED') {
        setIsFetching(true);
        const assetResp = await bc.lesson().getAsset(task.slug);
        if (assetResp && assetResp.status < 400) {
          const dataAsset = assetResp.data;
          if (!dataAsset?.delivery_formats.includes('url')) {
            const fileResp = await bc.todo().getFile({ id: task.id, academyId: cohortSession?.academy?.id });
            if (fileResp && fileResp.status < 400) {
              file = await fileResp.data;
            }
          }
        }
        setIsFetching(false);
      }
      setCurrentTask({ ...task, status, file });
    } catch (e) {
      toast({
        position: 'top',
        title: t('alert-message:review-url-error'),
        status: 'error',
        duration: 6000,
        isClosable: true,
      });
    }
  };

  return (
    <>
      <Box
        paddingBottom="30px"
        maxWidth={{ base: '90%', md: '90%', lg: '1012px' }}
        margin="2% auto 0 auto"
      >
        <Box
          display="flex"
          justifyContent="space-between"
        >
          <Link
            href={cohortSession?.selectedProgramSlug || '/choose-program'}
            color={linkColor}
            display="inline-block"
            letterSpacing="0.05em"
            fontWeight="700"
          >
            {`← ${t('back-to')}`}
          </Link>
        </Box>
        <Box
          display="flex"
          flexDirection={{ base: 'column', md: 'row' }}
          gridGap={{ base: '0', md: '10px' }}
          paddingTop="50px"
          alignItems={{ base: 'start', md: 'center' }}
        >
          <Heading
            size="m"
            style={{ margin: '0' }}
            padding={{ base: '0', md: '0 0 5px 0 !important' }}
          >
            {`${t('title')}:`}
          </Heading>
          {personalCohorts.length > 0 && (
            <ReactSelect
              unstyled
              color="#0097CD"
              fontWeight="700"
              id="cohort-select"
              fontSize="25px"
              placeholder={t('common:select-cohort')}
              noOptionsMessage={() => t('common:no-options-message')}
              value={selectedCohort || ''}
              onChange={(cohort) => {
                if (cohort.slug !== selectedCohort?.slug) {
                  setCurrentStudentList([]);
                  setContextState({
                    allTasks: [],
                  });
                }
                setSelectedCohort(cohort);
                router.push({
                  query: {
                    ...router.query,
                    cohortSlug: cohort.slug,
                  },
                });
              }}
              options={personalCohorts.map((cohort) => ({
                value: cohort.value,
                slug: cohort.slug,
                label: cohort.label,
              }))}
            />
          )}
        </Box>
      </Box>
      <Divider borderBottom="1px solid" color={borderColor} />

      <Box
        display="flex"
        flexWrap="wrap"
        justifyContent="space-between"
        gridGap="20px"
        maxWidth={{ base: '90%', md: '90%', lg: '1012px' }}
        margin={{ base: '3% auto', md: '3% auto 0 auto', lg: '3% auto 0 auto' }}
        padding={{ base: '0', lg: '0' }}
      >
        <ButtonGroup
          borderColor={hexColor.blueDefault}
          isAttached
          variant="outline"
          spacing="6"
        >
          <Button
            background={currentView === 0 ? hexColor.blueDefault : 'none'}
            borderColor={hexColor.blueDefault}
            _hover={{ opacity: 0.8 }}
            _active={{ opacity: 0.8 }}
            color={currentView === 0 ? '#FFF' : hexColor.blueDefault}
            textTransform="uppercase"
            padding="5px 15px"
            height="40px"
            leftIcon={(
              <Icon
                icon="student"
                width="15px"
                height="15px"
                color={currentView === 0 ? '#FFF' : hexColor.blueDefault}
              />
            )}
            onClick={() => {
              setCurrentView(0);
              router.push({
                query: {
                  ...router.query,
                  view: 0,
                },
              });
            }}
          >
            {t('students-view')}
          </Button>
          <Button
            background={currentView === 1 ? hexColor.blueDefault : 'none'}
            borderColor={hexColor.blueDefault}
            color={currentView === 1 ? '#FFF' : hexColor.blueDefault}
            _hover={{ opacity: 0.8 }}
            _active={{ opacity: 0.8 }}
            textTransform="uppercase"
            padding="5px 15px"
            height="40px"
            leftIcon={(
              <Icon
                icon="laptop-code"
                width="20px"
                height="20px"
                color={currentView === 1 ? '#FFF' : hexColor.blueDefault}
              />
            )}
            onClick={() => {
              setCurrentView(1);
              router.push({
                query: {
                  ...router.query,
                  view: 1,
                },
              });
            }}
          >
            {t('projects-view')}
          </Button>
        </ButtonGroup>
        <Box display="flex" gridGap="10px">
          <Button
            variant="ghost"
            color={hexColor.blueDefault}
            leftIcon={<Icon icon="filter" width="20px" height="20px" />}
            onClick={() => setOpenFilter(true)}
          >
            {t('common:filters')}
          </Button>
          <Popover maxWidth="200px" placement="bottom-start">
            <PopoverTrigger>
              <Button variant="unstyled" display="flex" gridGap="6px" color={hexColor.blueDefault} alignItems="center">
                <Icon icon="sort" width="18px" heigh="11px" color="currentColor" />
                <Text textTransform="uppercase" size="14px" fontWeight={700}>
                  {t('common:sort')}
                </Text>
              </Button>
            </PopoverTrigger>
            <PopoverContent>
              <PopoverArrow />
              <PopoverCloseButton />
              <PopoverBody display="flex" flexDirection="column" alignItems="flex-start" pl={4}>
                <Button
                  variant="unstyled"
                  onClick={() => {
                    const value = typeof sort === 'string' && sort.startsWith('-') ? 'user__first_name' : '-user__first_name';
                    setSort(value);
                    router.push({
                      query: {
                        ...router.query,
                        sort: value,
                      },
                    });
                  }}
                >
                  {`${t('sort.student')} ${typeof sort === 'string' && sort.startsWith('-') ? '▼' : '▲'}`}
                </Button>
              </PopoverBody>
            </PopoverContent>
          </Popover>
        </Box>
      </Box>
      <Modal isOpen={openFilter} onClose={closeFilterModal}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{t('common:filters')}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Box marginBottom="10px">
              <ReactSelect
                id="educational-select"
                placeholder={t('filter.educational-status')}
                isClearable
                isMulti
                value={educationalLabel || ''}
                onChange={(selected) => {
                  setEducationalLabel(selected || []);
                }}
                options={educationalStatusList.map((stat) => ({
                  value: stat.value,
                  label: stat.label,
                }))}
                styles={{
                  multiValue: () => ({
                    backgroundColor: hexColor.featuredColor,
                  }),
                }}
              />
            </Box>
            {currentView === 1 && (
              <Box marginBottom="10px">
                <ReactSelect
                  id="type-select"
                  placeholder={t('filter.type')}
                  isClearable
                  value={typeLabel}
                  height="50px"
                  fontSize="15px"
                  onChange={(selected) => {
                    setTypeLabel(
                      selected !== null
                        ? {
                          value: selected?.value,
                          label: selected?.label,
                        }
                        : null,
                    );
                  }}
                  options={typeList.map((type) => ({
                    value: type.value,
                    label: type.label,
                  }))}
                />
              </Box>
            )}
            {currentView === 1 && (
              <Box marginBottom="10px">
                <ReactSelect
                  id="project-select"
                  placeholder={t('filter.project')}
                  isClearable
                  value={projectLabel || ''}
                  // defaultInputValue={projectDefaultValue}
                  onChange={(selected) => {
                    setProjectLabel(
                      selected !== null
                        ? {
                          value: selected?.value,
                          label: selected?.label,
                        }
                        : null,
                    );
                  }}
                  options={syllabusData.assignments.map((project) => ({
                    value: project.slug,
                    label: project.title,
                  }))}
                />
              </Box>
            )}
            <Box marginBottom="10px">
              <ReactSelect
                id="student-select"
                placeholder={t('filter.student')}
                isClearable
                value={studentLabel || ''}
                height="50px"
                fontSize="15px"
                onChange={(selected) => {
                  setStudentLabel(
                    selected !== null
                      ? {
                        id: selected?.id,
                        value: selected?.value,
                        label: selected?.label,
                      }
                      : null,
                  );
                }}
                options={studentOptions}
              />
            </Box>
            {currentView === 1 && (
              <Box marginBottom="10px">
                <ReactSelect
                  id="status-select"
                  placeholder={t('filter.status')}
                  isClearable
                  value={statusLabel}
                  height="50px"
                  fontSize="15px"
                  // defaultInputValue={statusDefaultValue}
                  onChange={(selected) => {
                    setStatusLabel(
                      selected !== null
                        ? {
                          value: selected?.value,
                          label: selected?.label,
                        }
                        : null,
                    );
                  }}
                  options={statusList.map((status) => ({
                    value: status.value,
                    label: status.label,
                  }))}
                />
              </Box>
            )}
          </ModalBody>

          <ModalFooter justifyContent="space-between">
            <Button
              color={hexColor.blueDefault}
              variant="ghost"
              mr={3}
              onClick={clearFilters}
            >
              {t('common:clear-all')}
            </Button>
            <Button colorScheme="blue" onClick={applyFilters}>
              {t('common:apply-filters')}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      <Box
        gridGap="20px"
        maxWidth="1012px"
        margin={{ base: '3% 4%', md: '2% auto 2% auto', lg: '2% auto 2% auto' }}
        padding={{ base: '0', md: '0 10px', lg: '0' }}
        p="0 0 30px 0"
      >
        {currentView === 1 ? (
          <Box
            minHeight="34vh"
            borderRadius="3px"
            margin="0 auto"
            maxWidth="1012px"
            flexGrow={1}
            overflow="auto"
          >
            <Box
              display="flex"
              margin="20px 32px 20px 55px"
              gridGap="10px"
              justifyContent="space-between"
              flexDirection="row"
              alignItems="center"
              width={{ base: 'max-content', md: 'auto' }}
            >
              <Text
                size="15px"
                display="flex"
                width={{ base: '6.8rem', md: '50%' }}
                fontWeight="700"
              >
                {t('label.status')}
              </Text>
              <Text
                size="15px"
                display="flex"
                width={{ base: '13rem', md: '100%' }}
                fontWeight="700"
              >
                {t('label.student-and-assignments')}
              </Text>
              <Text
                size="15px"
                display="flex"
                width={{ base: '8.3rem', md: '40%' }}
                fontWeight="700"
              >
                {t('label.link')}
              </Text>
              <Text
                size="15px"
                display="flex"
                width={{ base: '25%', md: '25%' }}
                minWidth="115px"
                fontWeight="700"
              >
                {t('label.actions')}
              </Text>
            </Box>
            <Box display="flex" flexDirection="column" gridGap="18px">
              {filteredTasks.length > 0 ? (
                filteredTasks.map((task, i) => {
                  const index = i;
                  const githubUrl = task?.github_url;
                  const haveGithubDomain = githubUrl && isGithubUrl.test(githubUrl);
                  const fullName = `${task.user.first_name} ${task.user.last_name}`;
                  const projectLink = `${ORIGIN_HOST}${
                    lang[router.locale]
                  }project/${task.associated_slug}`;

                  return (
                    <Box
                      key={`${index}-${task.slug}-${task.title}-${fullName}`}
                      p="18px 28px"
                      display="flex"
                      width={{ base: 'max-content', md: '100%' }}
                      minWidth={{ base: '620px', md: '100%' }}
                      maxWidth={{ base: '620px', md: '100%' }}
                      gridGap="10px"
                      justifyContent="space-between"
                      flexDirection="row"
                      alignItems="center"
                      border="1px solid"
                      borderColor={borderColor}
                      borderRadius="17px"
                    >
                      <Box
                        display="flex"
                        width="auto"
                        minWidth="calc(160px - 0.5vw)"
                        // width="153px"
                      >
                        <Box width="28px" height="28px" marginRight="15px">
                          {syllabusData.assignments.find(
                            (assignment) => assignment.slug === task.associated_slug && assignment.mandatory,
                          ) && (
                            <Icon
                              icon="warning"
                              color="yellow.default"
                              width="28px"
                              height="28px"
                            />
                          )}
                        </Box>
                        <TaskLabel currentTask={task} t={t} />
                      </Box>

                      <Box width="35%">
                        <Text size="15px">{fullName}</Text>
                        <Link
                          variant="default"
                          href={projectLink}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {task.title}
                        </Link>
                      </Box>

                      <PopoverHandler
                        task={task}
                        haveGithubDomain={haveGithubDomain}
                        githubUrl={githubUrl}
                      />

                      <Box width="auto" minWidth="160px" textAlign="end">
                        <ButtonHandler
                          currentTask={task}
                          cohortSession={cohortSession}
                          contextState={contextState}
                          updpateAssignment={updpateAssignment}
                        />
                      </Box>
                    </Box>
                  );
                })
              ) : (
                <>
                  {loadStatus.status === 'loading' && (
                    <Box
                      display="flex"
                      justifyContent="center"
                      mt="2rem"
                      mb="5rem"
                      position="relative"
                    >
                      <LoaderScreen width="80px" height="80px" />
                    </Box>
                  )}
                  {loadStatus.loading === false && (
                    <Text
                      size="25px"
                      pt="3rem"
                      textAlign="center"
                      display="flex"
                      width="auto"
                      margin="0 auto"
                      fontWeight="700"
                    >
                      {t('common:search-not-found')}
                    </Text>
                  )}
                </>
              )}
              {allTasksOffset < contextState.allTasks.length !== null
                && isFetching && (
                  <Box
                    display="flex"
                    justifyContent="center"
                    mt="2rem"
                    mb="5rem"
                  >
                    <LoaderScreen width="80px" height="80px" />
                  </Box>
              )}
            </Box>
          </Box>
        ) : (
          <Box
            minHeight="34vh"
            borderRadius="3px"
            margin="0 auto"
            maxWidth="1012px"
            flexGrow={1}
            overflow="auto"
          >
            <Flex flexDirection="column" gridGap="18px">
              {currentStudentList.map((student) => {
                const { user } = student;
                const fullname = `${student.user.first_name} ${student.user.last_name}`;
                const percentage = Math.round((student.tasks.reduce((acum, val) => (val.task_status !== 'PENDING' && val.task_type === 'PROJECT' ? acum + 1 : acum), 0) / syllabusData.assignments.length) * 100);
                const lastDeliver = student.tasks.reduce((date, val) => {
                  if (date) return date > val ? date : val.updated_at;
                  if (val.updated_at && val.task_status !== 'PENDING' && val.task_type === 'PROJECT') return val.updated_at;
                  return null;
                }, null);
                const dots = syllabusData.assignments.map((elem) => {
                  const studentTask = student.tasks.find((task) => task.associated_slug === elem.slug);
                  const { mandatory } = elem;
                  return {
                    ...elem,
                    ...studentTask,
                    label: elem.title,
                    highlight: mandatory,
                    user,
                    color: statusColors[getStatus(studentTask)] || 'gray',
                  };
                });
                return (
                  <DottedTimeline
                    key={student.id}
                    onClickDots={showSingleTask}
                    label={(
                      <Flex gridGap="10px" alignItems="center">
                        <Avatar
                          src={student.user.profile?.avatar_url}
                          width="25px"
                          height="25px"
                          style={{ userSelect: 'none' }}
                        />
                        <Box>
                          <p>{fullname}</p>
                          <small>{`${percentage}${t('delivered-percentage')} - `}</small>
                          <small>{lastDeliver ? t('last-deliver', { date: formatTimeString(new Date(lastDeliver)) }) : t('no-deliver')}</small>
                        </Box>
                      </Flex>
                    )}
                    dots={dots}
                    helpText={`${t('educational-status')}: ${student.educational_status}`}
                  />
                );
              })}
            </Flex>
            <ReviewModal
              currentTask={currentTask}
              projectLink={`${ORIGIN_HOST}${
                lang[router.locale]
              }project/${currentTask?.slug}`}
              updpateAssignment={updpateAssignment}
              isOpen={currentTask && currentTask.status === 'DELIVERED'}
              onClose={() => setCurrentTask(null)}
            />
            <NoInfoModal
              isOpen={currentTask && !currentTask.status}
              onClose={() => setCurrentTask(null)}
            />
            <DeliverModal
              currentTask={currentTask}
              projectLink={`${ORIGIN_HOST}${
                lang[router.locale]
              }project/${currentTask?.slug}`}
              updpateAssignment={updpateAssignment}
              isOpen={currentTask && (currentTask.status === 'UNDELIVERED' || currentTask.status === 'REJECTED')}
              onClose={() => setCurrentTask(null)}
              deliveryUrl={deliveryUrl}
            />
            <DetailsModal
              currentTask={currentTask}
              projectLink={`${ORIGIN_HOST}${
                lang[router.locale]
              }project/${currentTask?.slug}`}
              updpateAssignment={updpateAssignment}
              isOpen={currentTask && currentTask.status === 'APPROVED'}
              onClose={() => setCurrentTask(null)}
            />
            {loadStatus.status === 'loading' && (
              <Box
                display="flex"
                justifyContent="center"
                mt="2rem"
                mb="5rem"
                position="relative"
              >
                <LoaderScreen width="80px" height="80px" />
              </Box>
            )}
          </Box>
        )}
      </Box>
    </>
  );
}

export default asPrivate(Assignments);
